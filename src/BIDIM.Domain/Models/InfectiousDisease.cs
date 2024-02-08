using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Models
{
    [Serializable]
    [Table("InfectiousDiseases")]
    public sealed class InfectiousDisease
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [NotMapped]
        public ICollection<Case> Cases { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
