var Guid = function() {
    function parse(value) {
        value = value.replace(/(0x|[-(){},])/g, '');

        if (value.length !== 32) throw new Error('Guid format not recognized')

        const hexOctets = new Array(16);
        
        for (let i = 0; i < 16; i++) {
            hexOctets[i] = value.substring(i * 2, i * 2 + 2)
        }
        
        return hexOctets;
    }

    function toHexOctets(bytes) {
        const hexOctets = new Array(16);

        for (let i = 0; i < 16; i++) {
            hexOctets[i] = bytes[i]
                .toString(16) // convert to hex string
                .padStart(2, '0'); // 0x0 -> '00'
        }

        return hexOctets;
    }

    function toBytes(hexOctets) {
        const bytes = new Uint8Array(16);

        for (let i = 0; i < 16; i++) {
            bytes[i] = parseInt(hexOctets[i], 16);
        }

        return bytes;
    }

    function toStringNone(hexOctets)
    {
        return hexOctets.join('');
    }

    function toStringDefault(hexOctets)
    {
        return hexOctets[0] + hexOctets[1] + hexOctets[2] + hexOctets[3] // time-low
            + '-' + hexOctets[4] + hexOctets[5] // time-mid
            + '-' + hexOctets[6] + hexOctets[7] // time-hi-and-version
            + '-' + hexOctets[8] // clock-seq-hi-and-reserved
            + hexOctets[9] // clock-seq-low
            + '-' + hexOctets[10] + hexOctets[11] + hexOctets[12] + hexOctets[13] + hexOctets[14] + hexOctets[15]; // node
    }

    function toStringParentheses(hexOctets){
        return '(' + toStringDefault(hexOctets) + ')';
    }

    function toStringBraces(hexOctets){
        return '{' + toStringDefault(hexOctets) + '}';
    }

    function toStringHex(hexOctets)
    {
        return '{'
            + '0x' + hexOctets[0] + hexOctets[1] + hexOctets[2] + hexOctets[3] + ',' // time-low
            + '0x' + hexOctets[4] + hexOctets[5] + ',' // time-mid
            + '0x' + hexOctets[6] + hexOctets[7] + ',' // time-hi-and-version
            + '{'
            + '0x' + hexOctets[8] + ',' // clock-seq-hi-and-reserved
            + '0x' + hexOctets[9] + ',' // clock-seq-low
            + '0x' + hexOctets[10] + ',' // node 0
            + '0x' + hexOctets[11] + ',' // node 1
            + '0x' + hexOctets[12] + ',' // node 2
            + '0x' + hexOctets[13] + ',' // node 3
            + '0x' + hexOctets[14] + ',' // node 4
            + '0x' + hexOctets[15] // node 5
            + '}}';
    }

    class Guid {
        constructor(value) {
            if (value instanceof Uint8Array) {
                this.bytes = value.slice();
                this.hexOctets = toHexOctets(this.bytes);
            } else if (typeof(value) === "string") {
                this.hexOctets = parse(value);
                this.bytes = toBytes(this.hexOctets);
            }

            Object.freeze(this);
        }

        equals(other) {
            for (let i = 0; i < 16; i++)
            {
                if (this.bytes[i] !== other.bytes[i])
                {
                    return false;
                }
            }
            return true;
        }

        toString(format) {
            if (arguments.length < 1)
            {
                return toStringDefault(this.hexOctets);
            }
        
            switch(format)
            {
                case "N":
                    return toStringNone(this.hexOctets);
                case "D":
                    return toStringDefault(this.hexOctets);
                case "P":
                    return toStringParentheses(this.hexOctets);
                case "B":
                    return toStringBraces(this.hexOctets);
                case "X":
                    return toStringHex(this.hexOctets);
                default:
                    throw new Error(`format "${format}" not recognized`);
            }
        }
    }

    Guid.prototype.bytes = new Uint8Array(16);
    Guid.prototype.hexOctets = toHexOctets(Guid.prototype.bytes);

    Guid.newGuid = function() {
        /*
            See RFC 4122 section 4.4 https://tools.ietf.org/html/rfc4122#section-4.4
    
            UUID                    =   time-low "-" time-mid "-"
                                        time-high-and-version "-"
                                        clock-seq-and-reserved
                                        clock-seq-low "-" node
            time-low                =   4hexOctet
            time-mid                =   2hexOctet
            time-high-and-version   =   2hexOctet
            clock-seq-and-reserved  =   hexOctet
            clock-seq-low           =   hexOctet
            node                    =   6hexOctet
            hexOctet                =   hexDigit hexDigit
            hexDigit =
                "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" /
                "a" / "b" / "c" / "d" / "e" / "f" /
                "A" / "B" / "C" / "D" / "E" / "F"
            
            128 bits / 4 bits per hex digit = 32 hex digits / 2 hex digits per byte = 16 bytes
        */

       const bytes = new Uint8Array(16);

       // Set all the other bits to randomly (or pseudo-randomly) chosen values.
       window.crypto.getRandomValues(bytes);

       // Set the four most significant bits (bits 12 through 15) of the time_hi_and_version field to the 4-bit version number from Section 4.1.3. (0100)
       bytes[6] = bytes[6] & 0b01001111 | 0b01000000;

       // Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively.
       bytes[8] = bytes[8] & 0b10111111 | 0b10000000;

       return new Guid(bytes);
    }

    return Guid;
}();

var guid = Guid.newGuid();
console.log(guid);
console.log(guid.toString());
console.log(guid.toString("N"));
console.log(guid.toString("D"));
console.log(guid.toString("B"));
console.log(guid.toString("P"));
console.log(guid.toString("X"));
console.log(guid.equals(guid));
console.log(Guid.prototype.equals(Guid.prototype));
console.log(Guid.prototype.equals(new Guid()));
