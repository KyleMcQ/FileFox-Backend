using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;

namespace FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Models;

public interface IUserStore
{
    Task<(bool Created, User? User, string? Error)> RegisterAsync(
        string userName,
        string email,
        string password,
        CancellationToken ct = default
    );

    Task<User?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken ct = default
    );

    Task UpdateAsync(User user);

    Task<(bool Found, User? User)> TryGetByIdAsync(Guid id);
}
