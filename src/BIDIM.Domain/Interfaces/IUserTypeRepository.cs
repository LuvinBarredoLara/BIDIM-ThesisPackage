using BIDIM.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Interfaces
{
    public interface IUserTypeRepository
    {
        public Task<List<UserType>> GetAllActive();
    }
}
