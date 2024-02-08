using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class CaseViewModel
    {
        public Guid Guid { get; set; }

        public string Id { get; set; }

        public string Outcome { get; set; }

        public DateTime OutcomeDate { get; set; }

        public Guid IndividualId { get; set; }

        public int InfectiousDiseaseId { get; set; }

        public bool IsActive { get; set; }

        public List<CaseMonitoringViewModel> CaseMonitorings { get; set; }
    }
}
