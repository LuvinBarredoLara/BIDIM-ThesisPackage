using BIDIM.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Status.Client
{
    public interface IStatusService
    {
        Task<List<StatusDropdown>> GetAllActive();
    }
}
