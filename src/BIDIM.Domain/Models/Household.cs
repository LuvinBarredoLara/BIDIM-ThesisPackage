using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Models
{
    [Table("Households")]
    public sealed class Household
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string FamilyName { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string CityMun { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Brgy { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Zone { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Street { get; set; }

        [Required]
        public double Long { get; set; }

        [Required]
        public double Lat { get; set; }

        /// <summary>
        /// Individuals within the household
        /// </summary>
        [NotMapped]
        public ICollection<Individual> Members { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
