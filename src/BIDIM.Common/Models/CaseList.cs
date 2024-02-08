using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class CaseList
    {
        public Guid Guid { get; set; }

        public string Id { get; set; }

        public string CreatedDate { get; set; }

        public string IndividualName { get; set; }

        public string InfectiousDisease { get; set; }

        public string Outcome { get; set; }

        public string OutcomeDate { get; set; }
    }
}
