using BIDIM.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Disease.Client
{
    public interface IInfectiousDiseaseService
    {
        Task<List<InfectiousDiseaseDropdown>> GetAllActive();
    }
}
