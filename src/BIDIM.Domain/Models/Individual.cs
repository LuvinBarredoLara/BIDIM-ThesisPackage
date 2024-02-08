using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BIDIM.Domain.Models
{
    [Table("Individuals")]
    public class Individual
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public DateTime DoB { get; set; }

        [Required]
        public int Age { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string ContactNumber { get; set; }

        [Required]
        public int HouseholdId { get; set; }
        [NotMapped]
        public Household Household { get; set; }

        /// <summary>
        /// Cases of this Individual
        /// </summary>
        [NotMapped]
        public ICollection<Case> Cases { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [Required]
        public bool IsDeceasedByDisease { get; set; }
    }
}
