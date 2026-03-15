using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using System;

// This is the info we show when listing files (no raw bytes).
namespace FileFox_Backend.Core.Models;

public class FileMetadataDto
{
    public Guid Id { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public long Length { get; init; }
    public DateTimeOffset UploadedAt { get; init; }
}