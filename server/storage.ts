import { Cve } from "@shared/schema";

export interface IStorage {
  getCves(): Promise<Cve[]>;
}

export class MemStorage implements IStorage {
  async getCves(): Promise<Cve[]> {
    return [
      {
        id: "CVE-2023-46805",
        description: "An authentication bypass vulnerability in the web component of Ivanti Connect Secure (9.x, 22.x) and Ivanti Policy Secure (9.x, 22.x) allows a remote attacker to access restricted resources by bypassing control checks.",
        cvss: 8.2,
        epss: 0.965,
        inKev: true,
        vulnerabilityClass: "Auth Bypass",
        affectedSoftware: ["Ivanti Connect Secure", "Ivanti Policy Secure"],
        year: 2023,
        exploits: [
          { id: "1", source: "metasploit", url: "https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/linux/http/ivanti_connect_secure_rce_cve_2023_46805.rb", name: "Ivanti Connect Secure Unauthenticated Remote Code Execution" }
        ]
      },
      {
        id: "CVE-2024-3094",
        description: "Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0. Through a series of complex obfuscations, the liblzma build process extracts a prebuilt object file from a disguised test file existing in the source code.",
        cvss: 10.0,
        epss: 0.812,
        inKev: true,
        vulnerabilityClass: "Backdoor / RCE",
        affectedSoftware: ["xz-utils", "liblzma"],
        year: 2024,
        exploits: [
          { id: "2", source: "github", url: "https://github.com/amlweems/xzbot", name: "xzbot" }
        ]
      },
      {
        id: "CVE-2021-44228",
        description: "Apache Log4j2 2.0-beta9 through 2.14.1 (excluding security releases 2.12.2, 2.12.3, and 2.3.1) JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.",
        cvss: 10.0,
        epss: 0.975,
        inKev: true,
        vulnerabilityClass: "RCE",
        affectedSoftware: ["Apache Log4j"],
        year: 2021,
        exploits: [
          { id: "3", source: "exploit-db", url: "https://www.exploit-db.com/exploits/50592", name: "Apache Log4j2 - Remote Code Execution (RCE)" }
        ]
      },
      {
        id: "CVE-2024-21626",
        description: "runc is a CLI tool for spawning and running containers according to the OCI specification. In runc 1.1.11 and earlier, due to an internal file descriptor leak, an attacker could cause a newly-spawned container process to have a working directory in the host filesystem namespace.",
        cvss: 8.6,
        epss: 0.432,
        inKev: false,
        vulnerabilityClass: "Container Breakout",
        affectedSoftware: ["runc"],
        year: 2024,
        exploits: [
          { id: "4", source: "github", url: "https://github.com/leesh3288/CVE-2024-21626", name: "CVE-2024-21626 PoC" }
        ]
      },
      {
        id: "CVE-2024-27198",
        description: "An authentication bypass vulnerability in JetBrains TeamCity before 2023.11.4 allows an unauthenticated attacker to bypass authentication.",
        cvss: 9.8,
        epss: 0.95,
        inKev: true,
        vulnerabilityClass: "Auth Bypass",
        affectedSoftware: ["JetBrains TeamCity"],
        year: 2024,
        exploits: [
          { id: "5", source: "metasploit", url: "https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/multi/http/jetbrains_teamcity_rce_cve_2024_27198.rb", name: "JetBrains TeamCity Unauthenticated Remote Code Execution" }
        ]
      }
    ];
  }
}

export const storage = new MemStorage();