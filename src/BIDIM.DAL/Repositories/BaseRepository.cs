using BIDIM.DAL.Context;
using BIDIM.Domain.Interfaces;

namespace BIDIM.DAL.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly BIDIMDbContext _context;

        public BaseRepository(BIDIMDbContext context)
        {
            _context = context;
        }

        public IQueryable<T> GetAll()
        {
            try
            {
                return _context.Set<T>();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retreiving entities: {ex.Message}");
            }
        }

        public async Task<T> Insert(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException($"{nameof(Insert)} entity must not be null");
            }

            using (var txn = _context.Database.BeginTransaction())
            {
                try
                {
                    await _context.AddAsync(entity);
                    await _context.SaveChangesAsync();

                    await txn.CommitAsync();

                    return entity;
                }
                catch (Exception ex)
                {
                    await txn.RollbackAsync();

                    throw new Exception($"Error creating entity {nameof(Insert)}: {ex.Message}");
                }
            }
        }

        public async Task<T> Update(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException($"{nameof(Update)} entity must not be null");
            }

            using (var txn = _context.Database.BeginTransaction())
            {
                try
                {
                    _context.Update(entity);

                    await _context.SaveChangesAsync();

                    await txn.CommitAsync();

                    return entity;
                }
                catch (Exception ex)
                {
                    await txn.RollbackAsync();

                    throw new Exception($"Error updating entity {nameof(Update)}: {ex.Message}");
                }
            }
        }
    }
}
