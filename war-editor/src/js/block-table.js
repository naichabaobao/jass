"use strict";
class BlockTable {
  constructor() {
    // Offset of the beginning of the file data, relative to the beginning of the archive.
    this.filePos = 0;
    // Compressed file size
    this.cSize = 0;
    // Size of uncompressed file
    this.fSize = 0;
    // Flags for the file. See the table below for more informations
    this.flags = 0;
  };
}
export default BlockTable;
