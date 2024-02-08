using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class CaseMonitoringViewModel
    {
        public int Id { get; set; }

        public string Symptoms { get; set; }

        public string Remarks { get; set; }

        public string CreatedDate { get; set; }

        public Guid CaseGuid { get; set; }

        public string Status { get; set; }

        public bool IsActive { get; set; }

        public int TempId { get; set; }
    }
}
