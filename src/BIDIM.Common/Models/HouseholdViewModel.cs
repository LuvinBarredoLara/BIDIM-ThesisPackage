using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class HouseholdViewModel
    {
        public int Id { get; set; }

        public string FamilyName { get; set; }

        public string CityMun { get; set; }

        public string Brgy { get; set; }

        public string Zone { get; set; }

        public string Street { get; set; }

        public double Long { get; set; }

        public double Lat { get; set; }
    }
}
