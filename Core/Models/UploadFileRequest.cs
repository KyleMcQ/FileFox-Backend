using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

// This matches the form data for uploads.
// It has one field named "file".
namespace FileFox_Backend.Core.Models;

public class UploadFileRequest
{
    public IFormFile? File { get; set; }
}