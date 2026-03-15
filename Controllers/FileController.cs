using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FileFox_Backend.Controllers;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using FileFox_Backend.Infrastructure.Services;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using FileFox_Backend.Infrastructure.Services;

[ApiController]
[Route("files")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IBlobStorageService _blob;
    private readonly IFileStore _fileStore;

    public FilesController(ApplicationDbContext db, IBlobStorageService blob, IFileStore fileStore)
    {
        _db = db;
        _blob = blob;
        _fileStore = fileStore;
    }
    
     // ---------------- INIT UPLOAD ----------------
    [HttpPost("init")]
    public async Task<IActionResult> Init([FromBody] InitUploadDto dto)
    {
        var userId = User.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var fileId = Guid.NewGuid();

        // store encrypted manifest header
        var headerBytes = Convert.FromBase64String(dto.EncryptedManifestHeader);
        await using var memoryStream = new MemoryStream(headerBytes);
        var manifestPath = await _blob.PutManifestAsync(fileId, memoryStream);

        var record = new FileRecord
        {
            Id = fileId,
            UserId = userId,
            EncryptedFileName = dto.EncryptedFileName,
            ChunkSize = dto.ChunkSize,
            CryptoVersion = dto.CryptoVersion,
            ManifestBlobPath = manifestPath,
            UploadedAt = DateTime.UtcNow
        };

        var key = new FileKey
        {
            FileRecordId = fileId,
            WrappedFileKey = dto.WrappedFileKey
        };

        _db.Files.Add(record);
        _db.FileKeys.Add(key);
        await _db.SaveChangesAsync();

        return Ok(new { fileId });
    }

    // ---------------- UPLOAD CHUNK ----------------
    [HttpPut("{id:guid}/chunks/{index:int}")]
    public async Task<IActionResult> UploadChunk(Guid id, int index)
    {
        await _blob.PutChunkAsync(id, index, Request.Body);
        return Ok();
    }

    // ---------------- DIRECT UPLOAD ----------------
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] UploadFileRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        if (request.File == null) return BadRequest("No file uploaded");

        var fileId = await _fileStore.SaveAsync(userId, request.File, ct);
        return Ok(new { fileId });
    }

    // ---------------- COMPLETE UPLOAD ----------------
    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var userId = User.GetUserId();
        var record = await _db.Files.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (record == null) return NotFound();

        // In a chunked upload, we might want to verify all chunks are present here.
        // For now, we'll just mark it as complete by ensuring it exists.

        return Ok(new { status = "Completed", fileId = id });
    }
}
