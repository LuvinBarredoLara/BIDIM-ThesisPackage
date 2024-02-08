using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class DashboardData
    {
        public int Population { get; set; }

        public int Infected { get; set; }

        public int Recovered { get; set; }

        public int Deceased { get; set; }

        public List<KeyValuePair<int, List<int>>> YearlyCasesPerMonth { get; set; }

        public int MaleCasesCount { get; set; }

        public int FemaleCasesCount { get; set; }

        public List<List<int>> IndividualsByAge { get; set; }
    }
}
