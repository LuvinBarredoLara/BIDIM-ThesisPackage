using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class IndividualList
    {
        public Guid Id { get; set; }

        public string FullName { get; set; }

        public string Gender { get; set; }

        public string HouseholdFamilyName { get; set; }

        public string IsActive { get; set; }
    }
}
