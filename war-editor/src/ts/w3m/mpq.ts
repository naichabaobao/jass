import fs from 'fs'

import HashTable from './hash-table';
import BlockTable from './block-table';
import errorString from './error-string'

const userDataMagic: number = new Buffer(['M', 'P', 'Q', 0x1b]).readInt32BE(0);

const headerMagic: number = new Buffer(['M', 'P', 'Q', 0x1a]).readInt32BE(0);

class MPQ {
  // The ID_MPQ ('MPQ\x1A') signature
  public id: number = headerMagic;

  // Size of the archive header
  public headerSize: number = 0;

  // Size of MPQ archive
  // This field is deprecated in the Burning Crusade MoPaQ format, and the size of the archive
  // is calculated as the size from the beginning of the archive to the end of the hash table,
  // block table, or extended block table (whichever is largest).
  public archiveSize: number = 0;

  // 0 = Format 1 (up to The Burning Crusade)
  // 1 = Format 2 (The Burning Crusade and newer)
  // 2 = Format 3 (WoW - Cataclysm beta or newer)
  // 3 = Format 4 (WoW - Cataclysm beta or newer)
  public formatVersion: number = 0; // short

  // Power of two exponent specifying the number of 512-byte disk sectors in each logical sector
  // in the archive. The size of each logical sector in the archive is 512 * 2^wBlockSize.
  public blockSize: number = 0; // short

  // Offset to the beginning of the hash table, relative to the beginning of the archive.
  public hashTablePos: number = 0;

  // Offset to the beginning of the block table, relative to the beginning of the archive.
  public blockTablePos: number = 0;

  // Number of entries in the hash table. Must be a power of two, and must be less than 2^16 for
  // the original MoPaQ format, or less than 2^20 for the Burning Crusade format.
  public hashTableSize: number = 0;

  // Number of entries in the block table
  public blockTableSize: number = 0;

  public hashTable: HashTable = new HashTable;

  public blockTable: BlockTable = new BlockTable;

  // 文件all bytes
  private content: Buffer = new Buffer([]);

  // mpq開始位置 0 或者 512
  private offset: number = 0;

  /**
   * @description 解析mpq字節
   * @param content 
   */
  private parse(content: Buffer) {
    let id: number = content.readIntLE(this.offset, 4);
    // 解析頭
    if (id) {
      if (id == headerMagic) {
        this.id = headerMagic;
      } else if (id == userDataMagic) {
        this.id = userDataMagic;
      } else {
        this.offset = 512;
        id = content.readIntLE(this.offset, 4)
        if (id == headerMagic) {
          this.id = headerMagic;
        } else if (id == userDataMagic) {
          this.id = userDataMagic;
        } else {
          throw new Error(errorString["not-found-mpq-id-error"]);
        }
      }
    }
    // 解析頭大小
    let headerSize:number = this.content.readUInt32LE(this.offset + 4);
    this.headerSize = headerSize;
    // 解析文檔大小
    let archiveSize:number = this.content.readUInt32LE(this.offset + 8);
    this.archiveSize = archiveSize;
    // mpq類型
    let formatVersion:number = this.content.readInt16LE(this.offset + 12);
    this.formatVersion = formatVersion;
    // blockSize
    let blockSize:number = this.content.readInt16LE(this.offset + 14);
    this.blockSize = blockSize;
    // hashTablePos
    let hashTablePos: number = this.content.readInt32LE(this.offset + 16);
    this.hashTablePos = hashTablePos;
    // blockTablePos
    let hashTableSize: number = this.content.readInt32LE(this.offset + 16);
    this.hashTableSize = hashTableSize;
    // blockTablePos
    let blockTablePos: number = this.content.readInt32LE(this.offset + 16);
    this.blockTablePos = blockTablePos;
    // blockTablePos
    let blockTableSize: number = this.content.readInt32LE(this.offset + 16);
    this.blockTableSize = blockTableSize;
  }

  constructor(){};

  public from(mpqFilePath: string) {
    this.content = fs.readFileSync(mpqFilePath);
    this.parse(this.content);
  }

}

export default MPQ;