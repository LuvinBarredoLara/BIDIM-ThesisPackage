using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class StatisticsViewModel
    {
        public List<object> SIRData { get; set; }

        public List<string> SIRMonthProjections { get; set; }

        public double InfectionRate { get; set; }

        public double RecoveryRate { get; set; }
    }
}
