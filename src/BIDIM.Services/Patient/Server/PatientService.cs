using BIDIM.Common.Models;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Patient.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patient.Server
{
    public class PatientService : IPatientService
    {
        protected readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<List<PatientList>> GetList()
        {
            var patientList = new List<PatientList>();

            var patients = await _patientRepository.GetAllActive();

            if(patients.Any())
            {
                foreach(var patient in patients)
                {
                    foreach(var record in patient.PatientRecords)
                    {
                        patientList.Add(new PatientList()
                        {
                            PatientGuid = patient.Id,
                            PatientId = patient.PatientId,
                            RecordId = record.Id,
                            FullName = $"{patient.FirstName} {patient.LastName}",
                            Disease = record.InfectiousDisease.Name,
                            ContactNumber = patient.ContactNumber,
                            AdmissionDate = record.DateReported.ToString("MM/dd/yyyy")
                        });
                    }
                }
            }

            return patientList.OrderByDescending(pl => pl.PatientId).ToList();
        }

        public async Task<PatientInfoViewModel> GetPatientInfo(Guid Id, int recordId)
        {
            var patientInfo = await _patientRepository.GetByGuid(Id);

            // Remove other records to display single record only
            var patientRecords = patientInfo.PatientRecords.Where(pr => pr.Id != recordId).ToList();
            foreach (var record in patientRecords)
                patientInfo.PatientRecords.Remove(record);

            return patientInfo.ToViewModel();
        }

        public async Task<bool> IsPatientIdExisting(string patientId, int diseaseId)
        {
            var patientInfo = await _patientRepository.GetByPatientId(patientId);

            if (patientInfo is null)
                return false;
            else
                return patientInfo.PatientRecords.FirstOrDefault(pr => pr.InfectiousDiseaseId == diseaseId &&
                                                                       pr.StatusId != 3) != null;
        }

        public async Task<bool> IsPatientRecordExisting(Guid patientGuid, int recordId, int diseaseId)
        {
            var patientInfo = await _patientRepository.GetByGuid(patientGuid);

            if (patientInfo is null)
                return false;
            else
            {
                if (recordId == 0)
                    return false;
                else
                {
                    // Check if has record w/ same disease
                    // that is not recovered
                    var record = patientInfo.PatientRecords
                        .FirstOrDefault(pr => pr.StatusId != 3 && 
                                              pr.InfectiousDiseaseId == diseaseId &&
                                              pr.Id != recordId);

                    return record != null;
                }
            }
        }

        public async Task<PatientInfoViewModel> Upsert(PatientInfoViewModel view)
        {
            PatientInfo patientInfo = view.Id == Guid.Empty ?
                view.ToNewDomainModel() :
                view.ToUpdatedDomainModel(await _patientRepository.GetByGuid(view.Id));

            PatientInfo upserted;

            if (view.Id == Guid.Empty)
                upserted = await _patientRepository.CreatePatient(patientInfo);
            else
                upserted = await _patientRepository.UpdatePatient(patientInfo);

            return upserted.ToViewModel();
        }

        public async Task<bool> Delete(Guid patientGuid)
        {
            var patientInfo = await _patientRepository.GetByGuid(patientGuid);

            if (patientInfo is null)
                return await Task.FromResult(true);
            else
            {
                patientInfo.IsDeleted = true;
                patientInfo.Household.IsActive = false;
                patientInfo.PatientRecords.ToList().ForEach(pr => pr.IsDeleted = true);

                await _patientRepository.UpdatePatient(patientInfo);

                return await Task.FromResult(true);
            }
        }

        public async Task<List<List<double>>> GetInfectedCoordinatesByFilter(InfectedFilter data)
        {
            List<double> coordinates;
            List<List<double>> retVal = new List<List<double>>();

            List<PatientInfo> patients = await _patientRepository.GetAllActive();

            if(patients.Any())
            {
                var patientsByLocAndDisease = patients.Where(p => p.Household.CityMun == data.CityMun &&
                                                        p.Household.Brgy == data.Brgy &&
                                                        p.PatientRecords.Any(pr => pr.DateReported <= data.DateTo && pr.DateReported >= data.DateFrom) && 
                                                        p.PatientRecords.Select(pr => pr.InfectiousDiseaseId).Contains(data.InfectiousDiseaseId))
                                                      .ToList();

                patientsByLocAndDisease.ForEach(p =>
                {
                    coordinates = new List<double>()
                    {
                        p.Household.Long,
                        p.Household.Lat
                    };
                    retVal.Add(coordinates);
                });
            }

            return retVal;
        }

        public async Task<List<object>> GetSIRDataByFilter(int diseaseId)
        {
            List<PatientRecord> records = new List<PatientRecord>();

            var patientInfos = await _patientRepository.GetAllActive();

            if(patientInfos.Any())
            {
                patientInfos.ForEach(p =>
                {
                    var record = p.PatientRecords.Where(pr => pr.IsDeleted == false &&
                                                             pr.InfectiousDiseaseId == diseaseId)
                                                 .FirstOrDefault();
                    if (record is not null)
                        records.Add(record);
                });
            }

            return records.Any() ? ComputeSIRData(records) : new List<object>();
        }

        private List<object> ComputeSIRData(List<PatientRecord> records)
        {
            List<object> retVal = new List<object>();




            //double infected = records.Count(r => r.Status.Id == 2);
            double N = 3594;
            double I = records.Count(r => r.Status.Id == 2);
            //double recovered = records.Count(r => r.Status.Id == 3);
            //double deceased = records.Count(r => r.Status.Id == 4);
            //double removed = recovered + deceased;
            //double R = 0;
            double R = records.Count(r => r.Status.Id == 3 || r.Status.Id == 4);
            //double susceptible = N - (I + deceased);
            //double S = 9000;
            double S = N - (records.Count(r => r.Status.Id == 2 || r.Status.Id == 4));
            //double N = S + I + R;
            //double totalRecords = S + I + R;
            double t = 0;
            double b = 2.0; // beta
            double a = 0.5; // gamma
            double scale = 0.1;

            for(int i = 1; i <= 100; i++)
            {
                retVal.Add(new { Data = new List<double>() { S, I, R } });

                double dS = (-b * S * I) / N;
                double dI = ((b * S * I) / N) - a * I;
                double dR = a * I;
                double dt = 1;

                S = S + dS * scale;
                I = I + dI * scale;
                R = R + dR * scale;


                t = t + dt * scale;
            }

            return retVal;
        }

        public async Task<DashboardData> GetDashboardDataByFilter(int diseaseId)
        {
            DashboardData retVal = null;

            List<PatientInfo> patients = await _patientRepository.GetAllActive();
            List<PatientInfo> patientsByDisease = new List<PatientInfo>();
            if (patients.Any())
                patientsByDisease = patients.Where(p => p.PatientRecords.Any(pr => pr.InfectiousDiseaseId == diseaseId)).ToList();

            int population, infected, recovered, deceased, malePatients, femalePatients;
            List<int> patientsPerMonth = new List<int>();
            List<List<int>> patientsByAge = new List<List<int>>();

            if(patientsByDisease.Any())
            {
                population = patientsByDisease.Count;
                infected = patientsByDisease.Count(p => p.PatientRecords.Any(pr => pr.StatusId == 2));
                recovered = patientsByDisease.Count(p => p.PatientRecords.Any(pr => pr.StatusId == 3));
                deceased = patientsByDisease.Count(p => p.PatientRecords.Any(pr => pr.StatusId == 4));
                malePatients = patientsByDisease.Count(p => p.Sex == "Male");
                femalePatients = patientsByDisease.Count(p => p.Sex == "Female");

                for(int i = 1; i <= 12; i++)
                {
                    patientsPerMonth.Add(patientsByDisease.Count(p => p.PatientRecords.Any(pr => pr.DateReported.Month == i)));
                }

                List<PatientInfo> filteredByAgePatients = new List<PatientInfo>();
                for (int i = 1; i <= 5; i++)
                {
                    switch(i)
                    {
                        case 1:
                            filteredByAgePatients = patientsByDisease.Where(p => p.Age <= 15).ToList();
                            if (filteredByAgePatients.Any())
                                patientsByAge.Add(new List<int>() 
                                {
                                    filteredByAgePatients.Count(p => p.Sex == "Male"),
                                    filteredByAgePatients.Count(p => p.Sex == "Female")
                                });
                            else
                                patientsByAge.Add(new List<int>()
                                {
                                    0,
                                    0
                                });
                            break;
                        case 2:
                            filteredByAgePatients = patientsByDisease.Where(p => p.Age >= 15 && p.Age <= 24).ToList();
                            if (filteredByAgePatients.Any())
                                patientsByAge.Add(new List<int>()
                                {
                                    filteredByAgePatients.Count(p => p.Sex == "Male"),
                                    filteredByAgePatients.Count(p => p.Sex == "Female")
                                });
                            else
                                patientsByAge.Add(new List<int>()
                                {
                                    0,
                                    0
                                });
                            break;
                        case 3:
                            filteredByAgePatients = patientsByDisease.Where(p => p.Age >= 25 && p.Age <= 34).ToList();
                            if (filteredByAgePatients.Any())
                                patientsByAge.Add(new List<int>()
                                {
                                    filteredByAgePatients.Count(p => p.Sex == "Male"),
                                    filteredByAgePatients.Count(p => p.Sex == "Female")
                                });
                            else
                                patientsByAge.Add(new List<int>()
                                {
                                    0,
                                    0
                                });
                            break;
                        case 4:
                            filteredByAgePatients = patientsByDisease.Where(p => p.Age >= 35 && p.Age <= 49).ToList();
                            if (filteredByAgePatients.Any())
                                patientsByAge.Add(new List<int>()
                                {
                                    filteredByAgePatients.Count(p => p.Sex == "Male"),
                                    filteredByAgePatients.Count(p => p.Sex == "Female")
                                });
                            else
                                patientsByAge.Add(new List<int>()
                                {
                                    0,
                                    0
                                });
                            break;
                        case 5:
                            filteredByAgePatients = patientsByDisease.Where(p => p.Age >= 50).ToList();
                            if (filteredByAgePatients.Any())
                                patientsByAge.Add(new List<int>()
                                {
                                    filteredByAgePatients.Count(p => p.Sex == "Male"),
                                    filteredByAgePatients.Count(p => p.Sex == "Female")
                                });
                            else
                                patientsByAge.Add(new List<int>()
                                {
                                    0,
                                    0
                                });
                            break;
                    }
                }

                // 0 = < 15
                // 1 = >= 15 && <= 24
                // 2 = >= 25 && <= 34
                // 3 = >= 35 && <= 49
                // 4 = >= 50
                List<List<int>> ageGroup = new List<List<int>>()
                {
                    new List<int>(),
                    new List<int>()
                };

                // Male
                var male = new List<int>()
                {
                    patientsByDisease.Count(p => p.Age < 15 && p.Sex == "Male"),
                    patientsByDisease.Count(p => p.Age >= 15 && p.Age <= 24 && p.Sex == "Male"),
                    patientsByDisease.Count(p => p.Age >= 25 && p.Age <= 34 && p.Sex == "Male"),
                    patientsByDisease.Count(p => p.Age >= 35 && p.Age <= 49 && p.Sex == "Male"),
                    patientsByDisease.Count(p => p.Age >= 50 && p.Sex == "Male"),
                };
                ageGroup[0].AddRange(male);

                // Female
                var female = new List<int>()
                {
                    patientsByDisease.Count(p => p.Age < 15 && p.Sex == "Female"),
                    patientsByDisease.Count(p => p.Age >= 15 && p.Age <= 24 && p.Sex == "Female"),
                    patientsByDisease.Count(p => p.Age >= 25 && p.Age <= 34 && p.Sex == "Female"),
                    patientsByDisease.Count(p => p.Age >= 35 && p.Age <= 49 && p.Sex == "Female"),
                    patientsByDisease.Count(p => p.Age >= 50 && p.Sex == "Female"),
                };
                ageGroup[1].AddRange(female);


                retVal = new DashboardData()
                {
                    Population = 3594,
                    Infected = infected,
                    Recovered = recovered,
                    Deceased = deceased,
                    PatientsPerMonth = patientsPerMonth,
                    MalePatientsCount = malePatients,
                    FemalePatientsCount = femalePatients,
                    PatientsByAge = ageGroup
                };
            } else
            {
                retVal = new DashboardData()
                {
                    Population = 3594,
                    Infected = 0,
                    Recovered = 0,
                    Deceased = 0,
                    PatientsPerMonth = new List<int>(12),
                    MalePatientsCount = 0,
                    FemalePatientsCount = 0,
                    PatientsByAge = new List<List<int>>()
                    {
                        new List<int>(5),
                        new List<int>(5)
                    }
            };
            }

            return retVal;
        }
    }

    internal static class PatientInfoViewModelExtension
    {
        internal static PatientInfo ToNewDomainModel(this PatientInfoViewModel view)
        {
            var model = new PatientInfo()
            {
                Id = view.Id,
                PatientId = view.PatientId,
                FirstName = view.FirstName,
                LastName = view.LastName,
                DoB = view.DoB,
                Age = view.Age,
                Sex = view.Sex,
                ContactNumber = view.ContactNumber,
                IsDeleted = false,
                HouseholdId = view.HouseholdInfo.Id // To update after upsert
            };

            var household = new Household()
            {
                Id = view.HouseholdInfo.Id,
                CityMun = view.HouseholdInfo.CityMun,
                Brgy = view.HouseholdInfo.Brgy,
                Zone = view.HouseholdInfo.Zone,
                Long = view.HouseholdInfo.Long,
                Lat = view.HouseholdInfo.Lat,
                IsActive = true
            };

            var patientRecord = new PatientRecord()
            {
                Id = view.PatientRecord.Id,
                PatientGuid = Guid.Empty, // To update after insert
                StatusId = view.PatientRecord.StatusId,
                InfectiousDiseaseId = view.PatientRecord.InfectiousDiseaseId,
                Symptoms = String.Empty,
                DateReported = view.PatientRecord.DateReported,
                IsDeleted = false
            };

            model.Household = household;
            model.PatientRecords = new List<PatientRecord>() { patientRecord };

            return model;
        }

        internal static PatientInfo ToUpdatedDomainModel(this PatientInfoViewModel view, PatientInfo pi)
        {
            pi.FirstName = view.FirstName;
            pi.LastName = view.LastName;
            pi.DoB = view.DoB;
            pi.Age = view.Age;
            pi.Sex = view.Sex;
            pi.ContactNumber = view.ContactNumber;

            pi.Household.CityMun = view.HouseholdInfo.CityMun;
            pi.Household.Brgy = view.HouseholdInfo.Brgy;
            pi.Household.Zone = view.HouseholdInfo.Zone;
            pi.Household.Long = view.HouseholdInfo.Long;
            pi.Household.Lat = view.HouseholdInfo.Lat;

            var patientRecord = pi.PatientRecords.FirstOrDefault(pr => pr.Id == view.PatientRecord.Id);
            if (patientRecord != null)
            {
                patientRecord.StatusId = view.PatientRecord.StatusId;
                patientRecord.InfectiousDiseaseId = view.PatientRecord.InfectiousDiseaseId;
                patientRecord.DateReported = view.PatientRecord.DateReported;
            }

            return pi;
        }
    
        internal static PatientInfoViewModel ToViewModel(this PatientInfo model)
        {
            var viewModel = new PatientInfoViewModel()
            {
                Id = model.Id,
                PatientId = model.PatientId,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DoB = model.DoB,
                Age = model.Age,
                Sex = model.Sex,
                ContactNumber = model.ContactNumber
            };

            viewModel.HouseholdInfo = new HouseholdViewModel()
            {
                Id = model.HouseholdId,
                CityMun = model.Household.CityMun,
                Brgy = model.Household.Brgy,
                Zone = model.Household.Zone,
                Long = model.Household.Long,
                Lat = model.Household.Lat
            };

            var data = model.PatientRecords.First();
            viewModel.PatientRecord = new PatientRecordViewModel()
            {

                Id = data.Id,
                PatientGuid = model.Id,
                StatusId = data.StatusId,
                InfectiousDiseaseId = data.InfectiousDiseaseId,
                DateReported = data.DateReported
            };

            return viewModel;
        }
    }
}
