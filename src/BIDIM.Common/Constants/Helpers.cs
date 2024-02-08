using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Constants
{
    public static class Helpers
    {
        public static List<string> StatusList
        {
            get => new List<string>()
            {
                "Asymptomatic",
                "Mild",
                "Severe",
                "Critical",
                "Recovered",
                "Deceased"
            };
        }

        public static List<string> OutcomeList
        {
            get => new List<string>()
            {
                "Infected",
                "Recovered",
                "Deceased"
            };
        }
    }
}
