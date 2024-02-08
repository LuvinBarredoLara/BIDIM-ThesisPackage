using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Models
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public string ObjectId { get; set; }

        [Required]
        public string ObjectData { get; set; }

        [Required]
        public string Module { get; set; }

        [Required]
        public string Operation { get; set; }

        [Required]
        public DateTime AuditDate { get; set; }

        [Required]
        public string AuditName { get; set; }
    }
}
