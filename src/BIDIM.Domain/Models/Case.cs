using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Models
{
    [Table("Cases")]
    public class Case
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Guid { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Id { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        public string? Outcome { get; set; }

        public DateTime? OutcomeDate { get; set; }

        [Required]
        public Guid IndividualId { get; set; }

        [Required]
        public int InfectiousDiseaseId { get; set; }

        [NotMapped]
        public Individual Individual { get; set; }
        [NotMapped]
        public InfectiousDisease InfectiousDisease { get; set; }
        [NotMapped]
        public ICollection<CaseMonitoring> CaseMonitorings { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
