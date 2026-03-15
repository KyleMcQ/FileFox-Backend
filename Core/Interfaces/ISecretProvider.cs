using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
namespace FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Models;

public interface ISecretProvider
{
    string GetSecret(string key);
}