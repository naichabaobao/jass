/*
void EncryptMpqBlock(void * pvDataBlock, DWORD dwLength, DWORD dwKey1)
{
LPDWORD DataBlock = (LPDWORD)pvDataBlock;
DWORD dwValue32;
DWORD dwKey2 = 0xEEEEEEEE;

// Round to DWORDs
dwLength >>= 2;

// Encrypt the data block at array of DWORDs
for(DWORD i = 0; i < dwLength; i++)
{
// Modify the second key
dwKey2 += StormBuffer[MPQ_HASH_KEY2_MIX + (dwKey1 & 0xFF)];

dwValue32 = DataBlock[i];
DataBlock[i] = DataBlock[i] ^ (dwKey1 + dwKey2);

dwKey1 = ((~dwKey1 << 0x15) + 0x11111111) | (dwKey1 >> 0x0B);
dwKey2 = dwValue32 + dwKey2 + (dwKey2 << 5) + 3;
}
}

void DecryptMpqBlock(void * pvDataBlock, DWORD dwLength, DWORD dwKey1)
{
LPDWORD DataBlock = (LPDWORD)pvDataBlock;
DWORD dwValue32;
DWORD dwKey2 = 0xEEEEEEEE;

// Round to DWORDs
dwLength >>= 2;

// Decrypt the data block at array of DWORDs
for(DWORD i = 0; i < dwLength; i++)
{
// Modify the second key
dwKey2 += StormBuffer[MPQ_HASH_KEY2_MIX + (dwKey1 & 0xFF)];

DataBlock[i] = DataBlock[i] ^ (dwKey1 + dwKey2);
dwValue32 = DataBlock[i];

dwKey1 = ((~dwKey1 << 0x15) + 0x11111111) | (dwKey1 >> 0x0B);
dwKey2 = dwValue32 + dwKey2 + (dwKey2 << 5) + 3;
}
}
*/

static mut crypt_table: [u32; x500] = [0; x500];

unsafe fn init() {
    let mut seed: u32 = 0x00100001;

    for i in 0x00..0x100 {
        for num in 0..5 {
            seed = (seed * 125 + 3) % 0x2aaaab;
            let temp = (seed & 0xffff) << 0x10;
            seed = (seed * 125 + 3) % 0x2aaaab;
            crypt_table[num * 0x100 + i] = temp | (seed & 0xffff)
        }
    }
}

struct Cryption {}

impl Cryption {
    pub fn encrypt(){}
    pub fn decrypt(data:[i8; 4], key:u32){
        let seed1 = key
        var seed2 = uint32(0xeeeeeeee)
        var ch uint32

        for i, size := 0, len(data); i < size; i += 4 {
            seed2 += cryptTable[0x400+(seed1&0xff)]

            // littleEndian byte order:
            ch = uint32(data[i]) | uint32(data[i+1])<<8 | uint32(data[i+2])<<16 | uint32(data[i+3])<<24
            ch ^= seed1 + seed2

            seed1 = ((^seed1 << 0x15) + 0x11111111) | (seed1 >> 0x0B)
            seed2 = ch + seed2 + (seed2 << 5) + 3

            data[i] = byte(ch)
            data[i+1] = byte(ch >> 8)
            data[i+2] = byte(ch >> 16)
            data[i+3] = byte(ch >> 24)
        }
    }
}
