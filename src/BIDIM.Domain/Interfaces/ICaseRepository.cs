using BIDIM.Domain.Models;

namespace BIDIM.Domain.Interfaces
{
    public interface ICaseRepository
    {
        Task<List<Case>> GetAllActive();

        Task<Case> GetByGuid(Guid caseId);

        Task<Case> GetById(string Id);

        Task<Case> CreateCase(Case data);

        Task<Case> UpdateCase(Case data);
    }
}
