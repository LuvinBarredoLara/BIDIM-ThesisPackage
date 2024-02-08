using BIDIM.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Interfaces
{
    public interface IIndividualRepository
    {
        Task<List<Individual>> GetAllActive();

        Task<List<Individual>> GetAllIncludeInactive();

        Task<Individual> GetById(Guid Id);

        Task<Individual> CreateIndividual(Individual model);

        Task<Individual> UpdateIndividual(Individual model);
    }
}
