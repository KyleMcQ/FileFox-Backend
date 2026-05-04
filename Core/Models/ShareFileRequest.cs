using System;

namespace FileFox_Backend.Core.Models;

public class ShareFileRequest
{
    public required string RecipientEmail { get; set; }
    public required string WrappedFileKey { get; set; }
}
