
const fs = require("fs");
import HashTable from './hash-table'
import BlockTable from "./block-table"
import errorString from "./error-string";
const userDataMagic = new Buffer(['M', 'P', 'Q', 0x1b]).readInt32BE(0);
const headerMagic = new Buffer(['M', 'P', 'Q', 0x1a]).readInt32BE(0);
class MPQ {
  constructor(path) {
    // The ID_MPQ ('MPQ\x1A') signature
    this.id = headerMagic;
    // Size of the archive header
    this.headerSize = 0;
    // Size of MPQ archive
    // This field is deprecated in the Burning Crusade MoPaQ format, and the size of the archive
    // is calculated as the size from the beginning of the archive to the end of the hash table,
    // block table, or extended block table (whichever is largest).
    this.archiveSize = 0;
    // 0 = Format 1 (up to The Burning Crusade)
    // 1 = Format 2 (The Burning Crusade and newer)
    // 2 = Format 3 (WoW - Cataclysm beta or newer)
    // 3 = Format 4 (WoW - Cataclysm beta or newer)
    this.formatVersion = 0; // short
    // Power of two exponent specifying the number of 512-byte disk sectors in each logical sector
    // in the archive. The size of each logical sector in the archive is 512 * 2^wBlockSize.
    this.blockSize = 0; // short
    // Offset to the beginning of the hash table, relative to the beginning of the archive.
    this.hashTablePos = 0;
    // Offset to the beginning of the block table, relative to the beginning of the archive.
    this.blockTablePos = 0;
    // Number of entries in the hash table. Must be a power of two, and must be less than 2^16 for
    // the original MoPaQ format, or less than 2^20 for the Burning Crusade format.
    this.hashTableSize = 0;
    // Number of entries in the block table
    this.blockTableSize = 0;
    this.hashTable = HashTable;
    this.blockTable = BlockTable;
    // 文件all bytes
    this.content = new Buffer([]);
    // mpq開始位置 0 或者 512
    this.offset = 0;

    this.content = fs.readFileSync(path);
    this.parse(this.content);
  }
  /**
   * @description 解析mpq字節
   * @param content
   */
  parse(content) {
    let id = content.readIntLE(this.offset, 4);
    // 解析頭
    if (id) {
      if (id == headerMagic) {
        this.id = headerMagic;
      }
      else if (id == userDataMagic) {
        this.id = userDataMagic;
      }
      else {
        this.offset = 512;
        id = content.readIntLE(this.offset, 4);
        if (id == headerMagic) {
          this.id = headerMagic;
        }
        else if (id == userDataMagic) {
          this.id = userDataMagic;
        }
        else {
          throw new Error(errorString["not-found-mpq-id-error"]);
        }
      }
    }
    // 解析頭大小
    let headerSize = this.content.readUInt32LE(this.offset + 4);
    this.headerSize = headerSize;
    // 解析文檔大小
    let archiveSize = this.content.readUInt32LE(this.offset + 8);
    this.archiveSize = archiveSize;
    // mpq類型
    let formatVersion = this.content.readInt16LE(this.offset + 12);
    this.formatVersion = formatVersion;
    // blockSize
    let blockSize = this.content.readInt16LE(this.offset + 14);
    this.blockSize = blockSize;
    // hashTablePos
    let hashTablePos = this.content.readInt32LE(this.offset + 16);
    this.hashTablePos = hashTablePos;
    // blockTablePos
    let hashTableSize = this.content.readInt32LE(this.offset + 16);
    this.hashTableSize = hashTableSize;
    // blockTablePos
    let blockTablePos = this.content.readInt32LE(this.offset + 16);
    this.blockTablePos = blockTablePos;
    // blockTablePos
    let blockTableSize = this.content.readInt32LE(this.offset + 16);
    this.blockTableSize = blockTableSize;
  }
  ;
}
export default MPQ;
