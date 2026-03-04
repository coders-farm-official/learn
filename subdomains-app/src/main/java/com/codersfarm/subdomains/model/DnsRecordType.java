package com.codersfarm.subdomains.model;

public enum DnsRecordType {

    A("A", "IPv4 Address",
      "Points your subdomain to an IPv4 address (like 93.184.216.34). " +
      "This is the most common record type — use it when you have a server's IP address."),

    AAAA("AAAA", "IPv6 Address",
         "Points your subdomain to an IPv6 address (like 2606:2800:220:1:248:1893:25c8:1946). " +
         "Works just like an A record, but for the newer, longer IP address format."),

    CNAME("CNAME", "Canonical Name (Alias)",
          "Points your subdomain to another hostname instead of an IP address. " +
          "Great for Cloudflare Tunnels, GitHub Pages, or any service that gives you a hostname to point at."),

    TXT("TXT", "Text Record",
        "Stores arbitrary text data. Commonly used for domain verification " +
        "(proving you own the domain), email security (SPF, DKIM, DMARC), and other metadata."),

    MX("MX", "Mail Exchange",
       "Tells email servers where to deliver mail for your subdomain. " +
       "If you want to receive email at you@handle.codersfarm.com, you need an MX record.");

    private final String code;
    private final String displayName;
    private final String description;

    DnsRecordType(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
    }

    public String getCode() { return code; }
    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
}
