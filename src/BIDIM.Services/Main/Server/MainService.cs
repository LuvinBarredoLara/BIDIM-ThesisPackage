using BIDIM.Common.Constants;
using BIDIM.Common.Models;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Main.Client;

namespace Main.Server
{
    public class MainService : IMainService
    {
        protected readonly IInfectiousDiseaseRepository _infectiousDiseaseRepository;
        protected readonly IHouseholdRepository _householdRepository;
        protected readonly IIndividualRepository _individualRepository;
        protected readonly ICaseRepository _caseRepository;

        public MainService(IInfectiousDiseaseRepository infectiousDiseaseRepository,
            IHouseholdRepository householdRepository,
            IIndividualRepository individualRepository,
            ICaseRepository caseRepository)
        {
            _infectiousDiseaseRepository = infectiousDiseaseRepository;
            _householdRepository = householdRepository;
            _individualRepository = individualRepository;
            _caseRepository = caseRepository;
        }

        #region > Dashboard
        public async Task<DashboardData> GetDashboardData(int diseaseId, int year)
        {
            int population = 0,
                infected = 0,
                recovered = 0,
                deceased = 0,
                maleCasesCount = 0,
                femaleCasesCount = 0;

            List<KeyValuePair<int, List<int>>> yearlyCasesPerMonth = new List<KeyValuePair<int, List<int>>>();

            List<List<int>> individualsByAge = new List<List<int>>();


            await Task.WhenAll(Task.Run(async () =>
            {
                var individuals = await _individualRepository.GetAllIncludeInactive();

                population = individuals.Count(i => i.IsActive);
                infected = individuals.Count(i => i.Cases
                                                    .Where(c => c.InfectiousDiseaseId == diseaseId)
                                                    .LastOrDefault(c => c.Outcome?.ToLower() == "infected") != null);

                recovered = individuals.Count(i => i.Cases
                                                    .Where(c => c.InfectiousDiseaseId == diseaseId)
                                                    .LastOrDefault(c => c.Outcome?.ToLower() == "recovered") != null);

                deceased = individuals.Count(i => i.Cases
                                                    .Where(c => c.InfectiousDiseaseId == diseaseId)
                                                    .LastOrDefault(c => c.Outcome?.ToLower() == "deceased") != null);

                var cases = await _caseRepository.GetAllActive();

                maleCasesCount = cases.Count(c => c.InfectiousDiseaseId == diseaseId &&
                                                  c.Individual.Gender.ToLower() == "male" &&
                                                  c.Individual.IsActive);
                femaleCasesCount = cases.Count(c => c.InfectiousDiseaseId == diseaseId && 
                                                    c.Individual.Gender.ToLower() == "female" &&
                                                    c.Individual.IsActive);

                // get earliest year w/ case
                int minYear = DateTime.Now.Year;
                if (cases.Any(c => c.InfectiousDiseaseId == diseaseId))
                    minYear = cases.Where(c => c.InfectiousDiseaseId == diseaseId)
                                   .Min(c => c.OutcomeDate ?? DateTime.Now).Year;

                for(int i = minYear; i <= DateTime.Now.Year; i++)
                {
                    List<int> cpm = new List<int>();
                    for(int month = 1; month <= 12; month++)
                    {
                        cpm.Add(cases.Count(c => c.InfectiousDiseaseId == diseaseId && 
                                                 c.OutcomeDate?.Year == i &&
                                                 c.OutcomeDate?.Month == month));
                    }

                    yearlyCasesPerMonth.Add(new KeyValuePair<int, List<int>>(i, cpm));
                }

                #region > Age list
                List<int> zeroTo14 = new List<int>()
                {
                    individuals.Count(i => i.Age < 15 &&
                                           i.Gender.ToLower() == "male"),
                    individuals.Count(i => i.Age < 15 &&
                                           i.Gender.ToLower() == "female"),
                };

                List<int> fifteenTo24 = new List<int>()
                {
                    individuals.Count(i => (i.Age >= 15 && i.Age <= 24) &&
                                           i.Gender.ToLower() == "male"),
                    individuals.Count(i => (i.Age >= 15 && i.Age <= 24) &&
                                           i.Gender.ToLower() == "female"),
                };

                List<int> twentyFiveTo34 = new List<int>()
                {
                    individuals.Count(i => (i.Age >= 25 && i.Age <= 34) &&
                                           i.Gender.ToLower() == "male"),
                    individuals.Count(i => (i.Age >= 25 && i.Age <= 34) &&
                                           i.Gender.ToLower() == "female"),
                };

                List<int> thirtyFiveTo44 = new List<int>()
                {
                    individuals.Count(i => (i.Age >= 35 && i.Age <= 44) &&
                                           i.Gender.ToLower() == "male"),
                    individuals.Count(i => (i.Age >= 35 && i.Age <= 44) &&
                                           i.Gender.ToLower() == "female"),
                };

                List<int> fortyFiveAbove = new List<int>()
                {
                    individuals.Count(i => i.Age >= 45 &&
                                           i.Gender.ToLower() == "male"),
                    individuals.Count(i => i.Age >= 45 &&
                                           i.Gender.ToLower() == "female"),
                };
                #endregion

                individualsByAge.AddRange(new List<List<int>>()
                {
                    zeroTo14,
                    fifteenTo24,
                    twentyFiveTo34,
                    thirtyFiveTo44,
                    fortyFiveAbove
                });

            }));

            return new DashboardData()
            {
                Population = population,
                Infected = infected,
                Recovered = recovered,
                Deceased = deceased,
                YearlyCasesPerMonth = yearlyCasesPerMonth,
                MaleCasesCount = maleCasesCount,
                FemaleCasesCount = femaleCasesCount,
                IndividualsByAge = individualsByAge,
            };
        }
        #endregion

        #region > Dropdowns
        public async Task<List<InfectiousDiseaseDropdown>> GetAllActiveInfectiousDiseasesDropdown()
        {
            List<InfectiousDiseaseDropdown> retVal = new List<InfectiousDiseaseDropdown>();

            List<InfectiousDisease> diseases = await _infectiousDiseaseRepository.GetAllActive();

            if (diseases.Any())
                diseases.ForEach(d => retVal.Add(d.ToDropdown()));

            return retVal;
        }

        public async Task<List<string>> GetAllStatusDropdown()
        {
            List<string> status = new List<string>(Helpers.StatusList);

            return await Task.FromResult(status);
        }
        #endregion

        #region > Household
        public async Task<List<HouseholdDropdown>> GetAllActiveHouseholdsDropdown()
        {
            List<HouseholdDropdown> retVal = new List<HouseholdDropdown>();

            var households = await _householdRepository.GetAllActive();

            if (households.Any())
                households.ForEach(h => retVal.Add(h.ToDropdown()));

            return retVal;
        }

        public async Task<List<HouseholdList>> GetHouseholdList()
        {
            List<HouseholdList> retVal = new List<HouseholdList>();

            var households = await _householdRepository.GetAllActive();

            if (households.Any())
                households.ForEach(h => retVal.Add(h.ToList()));

            return retVal;
        }

        public async Task<HouseholdViewModel> GetHouseholdById(int Id)
        {
            Household hh = await _householdRepository.GetById(Id);

            if (hh is null)
                return null;
            else
                return hh.ToViewModel();
        }

        public async Task<bool> CheckHouseholdFamilyNameExists(int Id, string hhFamilyName)
        {
            Household hh = await _householdRepository.GetByFamilyName(hhFamilyName.Trim());

            bool retVal;
            if (hh is null)
                retVal = false;
            else
                retVal = hh.Id != Id;

            return retVal;
        }

        public async Task<HouseholdViewModel> UpsertHousehold(HouseholdViewModel view)
        {
            Household household = view.Id == 0 ?
                view.ToNewDomainModel() :
                view.ToUpdatedDomainModel(await _householdRepository.GetById(view.Id));

            Household upserted;

            if (view.Id == 0)
                upserted = await _householdRepository.CreateHousehold(household);
            else
                upserted = await _householdRepository.UpdateHousehold(household);

            return upserted.ToViewModel();
        }
        #endregion

        #region > Individual
        public async Task<List<IndividualList>> GetIndividualList()
        {
            List<IndividualList> retVal = new List<IndividualList>();

            var individualList = await _individualRepository.GetAllIncludeInactive();

            if (individualList.Any())
                individualList.ForEach(i => retVal.Add(i.ToListViewModel()));

            return retVal.OrderBy(i => i.FullName).ToList();
        }

        public async Task<List<IndividualDropdownList>> GetIndividualDropdownList()
        {
            List<IndividualDropdownList> retVal = new List<IndividualDropdownList>();

            var individualList = await _individualRepository.GetAllIncludeInactive();

            if (individualList.Any())
                individualList.ForEach(i => retVal.Add(i.ToDropdownListViewModel()));

            return retVal.OrderBy(i => i.FullNameHousehold).ToList();
        }

        public async Task<IndividualViewModel> GetIndividualById(Guid Id)
        {
            Individual individual = await _individualRepository.GetById(Id);

            if (individual is null)
                return null;
            else
                return individual.ToViewModel();
        }

        public async Task<IndividualViewModel> UpsertIndividual(IndividualViewModel view)
        {
            Individual individual = view.Id == Guid.Empty ?
                view.ToNewDomainModel() :
                view.ToUpdatedDomainModel(await _individualRepository.GetById(view.Id));

            Individual upserted = view.Id == Guid.Empty ?
                await _individualRepository.CreateIndividual(individual) :
                await _individualRepository.UpdateIndividual(individual);

            return upserted.ToViewModel();
        }
        #endregion

        #region > Case
        public async Task<List<CaseList>> GetCaseList()
        {
            List<CaseList> retVal = new List<CaseList>();

            var cases = await _caseRepository.GetAllActive();

            if (cases.Any())
                cases.ForEach(c => retVal.Add(c.ToListViewModel()));

            return retVal;
        }

        public async Task<CaseViewModel> GetCaseByGuid(Guid Guid)
        {
            Case caseModel = await _caseRepository.GetByGuid(Guid);

            if (caseModel is null)
                return null;
            else
                return caseModel.ToViewModel();
        }

        public async Task<CaseViewModel> UpsertCase(CaseViewModel view)
        {
            Case caseModel = view.Guid == Guid.Empty ?
                view.ToNewDomainModel() :
                view.ToUpdatedDomainModel(await _caseRepository.GetByGuid(view.Guid));

            Case upsertedCase = view.Guid == Guid.Empty ?
                await _caseRepository.CreateCase(caseModel) :
                await _caseRepository.UpdateCase(caseModel);

            // Update individual outcome if deceased
            if(view.CaseMonitorings.OrderBy(cm => cm.CreatedDate).Last().Status.ToLower() == "deceased")
            {
                var ind = await _individualRepository.GetById(view.IndividualId);

                ind.IsActive = false;
                ind.IsDeceasedByDisease = true;

                await _individualRepository.UpdateIndividual(ind);
            }
            else
            {
                var ind = await _individualRepository.GetById(view.IndividualId);

                if(!ind.IsActive)
                    ind.IsActive = true;

                ind.IsDeceasedByDisease = false;

                await _individualRepository.UpdateIndividual(ind);
            }

            return upsertedCase.ToViewModel();
        }
        #endregion

        #region > Statistics
        public async Task<StatisticsViewModel> GetSIRData(int diseaseId)
        {
            List<Case> cases = await _caseRepository.GetAllActive();

            var individuals = await _individualRepository.GetAllIncludeInactive();

            return cases.Any() ?
                //ComputeSIRData(4000, cases.Where(c => c.InfectiousDiseaseId == diseaseId).ToList()) :
                ComputeSIRData(individuals.Count, cases.Where(c => c.InfectiousDiseaseId == diseaseId).ToList()) :
                new StatisticsViewModel()
                {
                    SIRData = new List<object>(),
                    InfectionRate = 0,
                    RecoveryRate = 0
                };
        }

        private StatisticsViewModel ComputeSIRData(int population, List<Case> cases)
        {
            StatisticsViewModel retVal = new StatisticsViewModel();
            
            retVal.SIRData = new List<object>();

            double N = population;
            double I = cases.Count(c => c.Outcome?.ToLower() == "infected");
            double R = cases.Count(c => c.Outcome?.ToLower() == "recovered");
            // Susceptible = population - (infected + deceased)
            double S = N - (cases.Count(c => (c.Outcome?.ToLower() == "infected" || c.Outcome?.ToLower() == "deceased")));
            double t = 0;

            double reproductionRate = 3;
            double a = 1.000 / 14.000; // gamma/recovery rate
            double b = reproductionRate * a; // beta/infection rate

            //double a = 0.5; // gamma/recovery rate
            //double b = 2.0; // beta/infection rate

            double scale = 0.1;

            retVal.InfectionRate = Math.Round(b, 2);
            retVal.RecoveryRate = Math.Round(a, 2);

            // Get last case date to get total days for 6-months projection
            DateTime? latestCaseDate = cases.Any() ? cases.OrderBy(c => c.CreatedDate).Last().CreatedDate : null;
            var daysOfProjection = 0;

            // Month/Year text
            List<string> monthOfProjection = new List<string>();

            if (latestCaseDate != null)
                for (int i = 1; i <= 6; i++)
                {
                    var nextMonth = latestCaseDate?.AddMonths(i);

                    if(nextMonth != null)
                    {
                        monthOfProjection.Add($"{nextMonth?.ToString("MMMM")} {nextMonth?.Year}");
                        daysOfProjection += new DateTime(nextMonth?.Year ?? 0, nextMonth?.Month ?? 0, 1, 0, 0, 0).AddMonths(1).AddSeconds(-1).Day;
                    }
                }

            // Set months projected
            retVal.SIRMonthProjections = monthOfProjection;

            for (int i = 1; i <= 6; i++)
            {
                retVal.SIRData.Add(new { Data = new List<double>() { S, I, R } });

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
        #endregion

        #region > Mapping
        public async Task<List<List<double>>> GetMappingData(InfectedFilter filter)
        {
            List<List<double>> retVal = new List<List<double>>();

            var households = await _householdRepository.GetAllActive();

            if(households.Any())
            {
                households.Where(c => c.Members.Any(m => 
                                                        m.Cases.Any(c => c.InfectiousDiseaseId == filter.InfectiousDiseaseId && 
                                                                         (c.CaseMonitorings.Any(cm => cm.CreatedDate <= filter.DateTo && 
                                                                                                      cm.CreatedDate >= filter.DateFrom)))))
                          .ToList()
                          .ForEach(h => retVal.Add(new List<double>() { h.Long, h.Lat }));
            }

            return retVal;
        }
        #endregion
    }

    #region > EXTENSIONS
    internal static class InfectiousDiseaseExtension
    {
        internal static InfectiousDiseaseDropdown ToDropdown(this InfectiousDisease model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new InfectiousDiseaseDropdown()
            {
                Id = model.Id,
                Name = model.Name
            };
        }
    }

    internal static class HouseholdExtension
    {
        internal static HouseholdDropdown ToDropdown(this Household model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new HouseholdDropdown()
            {
                Id = model.Id,
                FamilyName = model.FamilyName
            };
        }

        internal static HouseholdList ToList(this Household model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new HouseholdList()
            {
                Id = model.Id,
                FamilyName = model.FamilyName,
                MemberCount = model.Members.Count
            };
        }

        internal static HouseholdViewModel ToViewModel(this Household model)
        {
            if (model is null)
                throw new NullReferenceException($"{nameof(model)} cannot be null");

            return new HouseholdViewModel()
            {
                Id = model.Id,
                FamilyName = model.FamilyName,
                CityMun = model.CityMun,
                Brgy = model.Brgy,
                Zone = model.Zone,
                Street = model.Street,
                Long = model.Long,
                Lat = model.Lat
            };
        }

        internal static Household ToNewDomainModel(this HouseholdViewModel view)
        {
            return new Household()
            {
                Id = 0,
                FamilyName = view.FamilyName,
                CityMun = view.CityMun,
                Brgy = view.Brgy,
                Zone = view.Zone,
                Street = view.Street,
                Long = view.Long,
                Lat = view.Lat,
                IsActive = true
            };
        }

        internal static Household ToUpdatedDomainModel(this HouseholdViewModel view, Household household)
        {
            household.FamilyName = view.FamilyName;
            household.CityMun = view.CityMun;
            household.Brgy = view.Brgy;
            household.Zone = view.Zone;
            household.Street = view.Street;
            household.Long = view.Long;
            household.Lat = view.Lat;

            return household;
        }
    }
    
    internal static class IndividualExtension
    {
        internal static IndividualList ToListViewModel(this Individual model)
        {
            return new IndividualList()
            {
                Id = model.Id,
                FullName = $"{model.FirstName} {model.LastName}",
                Gender = model.Gender,
                HouseholdFamilyName = model.Household.FamilyName,
                IsActive = model.IsActive ? "Yes" : "No"
            };
        }

        internal static IndividualDropdownList ToDropdownListViewModel(this Individual model)
        {
            return new IndividualDropdownList()
            {
                Id = model.Id,
                FullNameHousehold = $"{model.FirstName} {model.LastName} | {model.Household.FamilyName}",
            };
        }

        internal static IndividualViewModel ToViewModel(this Individual model)
        {
            return new IndividualViewModel()
            {
                Id = model.Id,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DoB = model.DoB,
                Age = model.Age,
                Gender = model.Gender,
                ContactNumber = model.ContactNumber,
                HouseholdId = model.HouseholdId,
                IsActive = model.IsActive,
                IsDeceasedByDisease = model.IsDeceasedByDisease
            };
        }

        internal static Individual ToNewDomainModel(this IndividualViewModel view)
        {
            return new Individual()
            {
                Id = Guid.Empty,
                FirstName = view.FirstName,
                LastName = view.LastName,
                DoB = view.DoB,
                Age = view.Age,
                Gender = view.Gender,
                ContactNumber = view.ContactNumber,
                HouseholdId = view.HouseholdId,
                IsActive = true,
                IsDeceasedByDisease = false
            };
        }

        internal static Individual ToUpdatedDomainModel(this IndividualViewModel view, Individual individual)
        {
            individual.FirstName = view.FirstName;
            individual.LastName = view.LastName;
            individual.DoB = view.DoB;
            individual.Age = view.Age;
            individual.Gender = view.Gender;
            individual.ContactNumber = view.ContactNumber;
            individual.HouseholdId = view.HouseholdId;
            individual.IsActive = view.IsActive;
            individual.IsDeceasedByDisease = view.IsDeceasedByDisease;

            return individual;
        }
    }
    
    internal static class CaseExtension
    {
        internal static CaseList ToListViewModel(this Case model)
        {
            return new CaseList()
            {
                Guid = model.Guid,
                Id = model.Id,
                CreatedDate = model.CreatedDate.ToString("MM/dd/yyyy"),
                IndividualName = $"{model.Individual.FirstName} {model.Individual.LastName}",
                InfectiousDisease = model.InfectiousDisease.Name,
                Outcome = model.Outcome ?? "Infected",
                OutcomeDate = model.OutcomeDate?.ToString("MM/dd/yyyy") ?? DateTime.Now.ToString("MM/dd/yyyy")
            };
        }

        internal static CaseViewModel ToViewModel(this Case model)
        {
            var retVal = new CaseViewModel()
            {
                Guid = model.Guid,
                Id = model.Id,
                Outcome = model.Outcome ?? "",
                OutcomeDate = model.OutcomeDate ?? new DateTime(),
                IndividualId = model.IndividualId,
                InfectiousDiseaseId = model.InfectiousDiseaseId,
                IsActive = model.IsActive,
                CaseMonitorings = new List<CaseMonitoringViewModel>()
            };

            if (model.CaseMonitorings.Any())
                model.CaseMonitorings.OrderBy(cm => cm.CreatedDate).ToList().ForEach(cm =>
                {
                    retVal.CaseMonitorings.Add(new CaseMonitoringViewModel()
                    {
                        Id = cm.Id,
                        Symptoms = cm.Symptoms,
                        Remarks = cm.Remarks,
                        CreatedDate = cm.CreatedDate.ToString("MM/dd/yyyy"),
                        CaseGuid = cm.CaseId,
                        Status = cm.Status,
                        IsActive = cm.IsActive,
                        TempId = 0
                    });
                });

            return retVal;
        }

        internal static Case ToNewDomainModel(this CaseViewModel view)
        {
            var retVal = new Case()
            {
                Guid = Guid.Empty,
                Id = view.Id,
                CreatedDate = DateTime.Now,
                Outcome = "",
                OutcomeDate = DateTime.Now,
                IndividualId = view.IndividualId,
                InfectiousDiseaseId = view.InfectiousDiseaseId,
                IsActive = true,
            };

            retVal.CaseMonitorings = new List<CaseMonitoring>();

            view.CaseMonitorings.ForEach(cm =>
            {
                retVal.CaseMonitorings.Add(new CaseMonitoring()
                {
                    Id = 0,
                    Symptoms = cm.Symptoms,
                    Remarks = cm.Remarks,
                    CreatedDate = DateTime.Parse(cm.CreatedDate),
                    CaseId = Guid.Empty,
                    Status = cm.Status,
                    IsActive = true
                });
            });

            var latestMonitoring = view.CaseMonitorings.OrderBy(cm => cm.CreatedDate).Last();

            switch(latestMonitoring.Status.ToLower())
            {
                case "recovered":
                    retVal.Outcome = "Recovered";
                    retVal.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
                case "deceased":
                    retVal.Outcome = "Deceased";
                    retVal.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
                default:
                    retVal.Outcome = "Infected";
                    retVal.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
            }

            return retVal;
        }

        internal static Case ToUpdatedDomainModel(this CaseViewModel view, Case model)
        {
            model.Id = view.Id;
            model.Outcome = "";
            model.OutcomeDate = DateTime.Now;
            model.IndividualId = view.IndividualId;
            model.InfectiousDiseaseId = view.InfectiousDiseaseId;
            model.IsActive = view.IsActive;

            // Add new case monitorings to model
            if (view.CaseMonitorings.Where(cm => cm.Id == 0).Any())
                view.CaseMonitorings.Where(cm => cm.Id == 0).ToList().ForEach(ncm =>
                {
                    model.CaseMonitorings.Add(new CaseMonitoring()
                    {
                        Id = 0,
                        Symptoms = ncm.Symptoms,
                        Remarks = ncm.Remarks,
                        CreatedDate = DateTime.Parse(ncm.CreatedDate),
                        CaseId = model.Guid,
                        Status = ncm.Status,
                        IsActive = true
                    });
                });

            // Update case monitorings from view to model
            view.CaseMonitorings.Where(cm => cm.Id != 0).ToList().ForEach(ocm =>
            {
                var cmToUpdate = model.CaseMonitorings.Where(mcm => mcm.Id == ocm.Id).FirstOrDefault();

                if(cmToUpdate is not null)
                {
                    cmToUpdate.Symptoms = ocm.Symptoms;
                    cmToUpdate.Remarks = ocm.Remarks;
                    cmToUpdate.CreatedDate = DateTime.Parse(ocm.CreatedDate);
                    cmToUpdate.Status = ocm.Status;
                    cmToUpdate.IsActive = ocm.IsActive;
                }
            });

            var latestMonitoring = view.CaseMonitorings.OrderBy(cm => cm.CreatedDate).Last();

            switch (latestMonitoring.Status.ToLower())
            {
                case "recovered":
                    model.Outcome = "Recovered";
                    model.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
                case "deceased":
                    model.Outcome = "Deceased";
                    model.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
                default:
                    model.Outcome = "Infected";
                    model.OutcomeDate = DateTime.Parse(latestMonitoring.CreatedDate);
                    break;
            }

            return model;
        }
    }
    #endregion
}
