using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Models
{
    [Table("CaseMonitorings")]
    public class CaseMonitoring
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Symptoms { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Remarks { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        [Required]
        public Guid CaseId { get; set; }

        [Required]
        public string Status { get; set; }

        [NotMapped]
        public Case Case { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
