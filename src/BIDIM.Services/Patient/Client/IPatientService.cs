using BIDIM.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patient.Client
{
    public interface IPatientService
    {
        Task<PatientInfoViewModel> Upsert(PatientInfoViewModel view);

        Task<bool> Delete(Guid patientGuid);

        Task<List<PatientList>> GetList();

        Task<PatientInfoViewModel> GetPatientInfo(Guid Id, int recordId);

        Task<bool> IsPatientIdExisting(string patientId, int diseaseId);

        Task<bool> IsPatientRecordExisting(Guid patientGuid, int recordId, int diseaseId);

        Task<List<List<double>>> GetInfectedCoordinatesByFilter(InfectedFilter data);

        Task<List<object>> GetSIRDataByFilter(int diseaseId);

        Task<DashboardData> GetDashboardDataByFilter(int diseaseId);
    }
}
