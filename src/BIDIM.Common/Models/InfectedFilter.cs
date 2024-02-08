using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class InfectedFilter
    {
        public DateTime DateFrom { get; set; }

        public DateTime DateTo { get; set; }

        public int InfectiousDiseaseId { get; set; }
    }
}
