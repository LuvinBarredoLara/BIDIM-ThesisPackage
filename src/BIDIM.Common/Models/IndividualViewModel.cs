using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Models
{
    public class IndividualViewModel
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public DateTime DoB { get; set; }

        public int Age { get; set; }

        public string Gender { get; set; }

        public string ContactNumber { get; set; }

        public int HouseholdId { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeceasedByDisease { get; set; }
    }
}
