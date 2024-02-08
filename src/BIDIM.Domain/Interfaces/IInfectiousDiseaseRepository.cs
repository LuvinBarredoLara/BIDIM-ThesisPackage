using BIDIM.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Interfaces
{
    public interface IInfectiousDiseaseRepository
    {
        public Task<InfectiousDisease> GetById(int Id);

        public Task<InfectiousDisease> GetByName(string name);

        public Task<List<InfectiousDisease>> GetAllActive();
    }
}
