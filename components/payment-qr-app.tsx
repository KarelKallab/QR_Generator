"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type CurrencyCode = "CZK" | "EUR";

type PaymentConfig = {
  currency: CurrencyCode;
  recipient: string;
  accountLabel: string;
  iban?: string;
  variableSymbol?: string;
  paymentDueDate?: string;
  enabled: boolean;
};

const PAYMENT_CONFIG: Record<CurrencyCode, PaymentConfig> = {
  CZK: {
    currency: "CZK",
    recipient: "Charlieczech s.r.o.",
    accountLabel: "3595077018/3030",
    iban: convertCzechAccountToIban("3595077018", "3030"),
    enabled: true
  },
  EUR: {
    currency: "EUR",
    recipient: "Charlieczech s.r.o.",
    accountLabel: "CZ3330300000003595077034",
    iban: "CZ3330300000003595077034",
    variableSymbol: "2024000036",
    paymentDueDate: "20260406",
    enabled: true
  }
};

const currencyOptions: CurrencyCode[] = ["CZK", "EUR"];

export function PaymentQrApp() {
  const [currency, setCurrency] = useState<CurrencyCode>("CZK");
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState("Objednávka Charlieczech");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrError, setQrError] = useState("");

  const config = PAYMENT_CONFIG[currency];
  const normalizedAmount = useMemo(() => parseAmount(amount), [amount]);

  const payload = useMemo(() => {
    if (!config.enabled || normalizedAmount === null) {
      return null;
    }

    if (currency === "EUR") {
      return createQrGeneratorUrl({
        amount: normalizedAmount,
        iban: config.iban ?? "",
        beneficiaryName: config.recipient,
        variableSymbol: config.variableSymbol,
        paymentDueDate: config.paymentDueDate
      });
    }

    return createPaymentPayload({
      amount: normalizedAmount,
      currency,
      note,
      recipient: config.recipient,
      iban: config.iban ?? ""
    });
  }, [config, currency, normalizedAmount, note]);

  useEffect(() => {
    let active = true;

    if (!payload) {
      setQrCodeUrl("");
      setQrError("");
      return () => {
        active = false;
      };
    }

    if (currency === "EUR") {
      setQrError("");
      setQrCodeUrl(payload);

      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 520,
      color: {
        dark: "#16110e",
        light: "#f7efe2"
      }
    })
      .then((url) => {
        if (active) {
          setQrError("");
          setQrCodeUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeUrl("");
          setQrError("QR kód se nepodařilo vygenerovat.");
        }
      });

    return () => {
      active = false;
    };
  }, [currency, payload]);

  const formattedAmount =
    normalizedAmount !== null ? `${formatAmount(normalizedAmount)} ${currency}` : "Zadej platnou částku";
  const formatLabel = currency === "EUR" ? "Slovenská QR platba (PAY by square)" : "Česká QR platba (SPD)";
  const dueDateLabel = config.paymentDueDate ? formatDate(config.paymentDueDate) : "Bez splatnosti";
  const variableSymbolLabel = config.variableSymbol ?? "Bez VS";

  return (
    <section className="section-shell py-6 sm:py-8 lg:py-10">
      <div className="mx-auto min-w-0 w-full max-w-[1180px]">
        <div className="mb-6 flex justify-center">
          <a href="/" className="inline-flex">
            <img
              src="/images/CHARLIECZECH_WHITE.png"
              alt="Charlieczech"
              className="h-auto w-[160px] object-contain sm:w-[186px]"
            />
          </a>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="panel relative min-w-0 overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(26,18,14,0.94),rgba(33,23,18,0.86))] px-4 py-6 shadow-glow sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full bg-lager/10" />

            <h1 className="display-title relative z-10 text-[clamp(3.8rem,8vw,6.8rem)] uppercase leading-[0.98] tracking-[0.02em] text-cream">
              Platba
            </h1>

            <p className="relative z-10 mt-5 max-w-[60ch] text-base leading-8 text-sand/75 sm:text-[1.06rem]">
              Jednoduchá platební obrazovka pro CZK a EUR. Vyber měnu, zadej částku a případnou poznámku a QR kód se
              přepočítá okamžitě pod formulářem.
            </p>

            <div className="relative z-10 mt-8 inline-flex w-full min-w-0 rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
              {currencyOptions.map((option) => {
                const isActive = option === currency;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCurrency(option)}
                    className={`min-h-[52px] flex-1 rounded-full px-5 text-sm font-extrabold uppercase tracking-[0.18em] transition sm:min-w-[108px] sm:flex-none sm:px-6 ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#d9a441,#b87c2d)] text-ink shadow-[0_14px_28px_rgba(184,124,45,0.28)]"
                        : "text-sand/70 hover:-translate-y-px hover:text-cream"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 mt-7 grid gap-4">
              <label className="block">
                <span className="mb-2.5 block text-xs font-extrabold uppercase tracking-[0.22em] text-sand/55">
                  Částka
                </span>
                <div className="flex min-h-[68px] min-w-0 w-full items-center gap-3 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 px-4 transition focus-within:border-lager/50 focus-within:bg-white/8 sm:min-h-[78px] sm:gap-4 sm:px-5">
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="min-w-0 w-0 flex-1 bg-transparent text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold tracking-[0.02em] text-cream outline-none placeholder:text-sand/30"
                  />
                  <span className="shrink-0 text-xs font-extrabold uppercase tracking-[0.18em] text-sand/65 sm:text-sm sm:tracking-[0.24em]">
                    {currency}
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2.5 block text-xs font-extrabold uppercase tracking-[0.22em] text-sand/55">
                  Poznámka
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Například číslo objednávky nebo krátká poznámka"
                  className="block min-h-[110px] w-full min-w-0 resize-y rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-base leading-7 text-cream outline-none transition placeholder:text-sand/30 focus:border-lager/50 focus:bg-white/8 sm:min-h-[130px] sm:px-5"
                />
              </label>
            </div>

            <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
              <InfoPill label="Příjemce" value={config.recipient} />
              <InfoPill label="Měna" value={config.currency} />
              <InfoPill label="Účet" value={config.accountLabel} />
            </div>
          </section>

          <section
            className="panel-light min-w-0 flex flex-col justify-between rounded-[30px] border border-[#3a2a1f]/18 px-4 py-6 text-[#2f2118] shadow-card sm:px-6 sm:py-8 lg:px-10 lg:py-10"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(247, 239, 226, 0.96), rgba(239, 226, 207, 0.9)), url('/images/papir-textura.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div>
              <div className="flex justify-center text-center">
                <div>
                  <h2 className="display-title text-[clamp(2.3rem,5vw,3.5rem)] uppercase leading-none tracking-[0.02em] text-[#2f2118]">
                    QR kód
                  </h2>
                </div>
              </div>

              <div className="mx-auto mt-8 w-full max-w-[360px] rounded-[30px] border border-[#3c2a1c]/14 bg-[rgba(255,248,238,0.92)] p-4 shadow-card sm:p-[22px]">
                <div className="flex aspect-square min-h-[260px] items-center justify-center rounded-[24px] border border-[#3c2a1c]/10 bg-[#f7efe2] p-4 sm:min-h-[296px] sm:p-[18px]">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`QR kód pro platbu v měně ${currency}`}
                      className={`h-full w-full max-h-full max-w-full object-contain ${currency === "EUR" ? "mix-blend-multiply" : ""}`}
                    />
                  ) : (
                    <div className="rounded-[18px] bg-[#f4eadc] px-6 py-5 text-center text-sm leading-6 text-[#7a5840]">
                      {qrError || "Zadej platnou částku a QR kód se objeví okamžitě."}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-[18px] flex justify-center">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((value) => !value)}
                  aria-expanded={detailsOpen}
                  aria-controls="details-panel"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#3c2a1c]/14 bg-[rgba(255,246,232,0.86)] px-[22px] text-[0.82rem] font-extrabold uppercase tracking-[0.2em] text-[#5c4331] transition hover:-translate-y-px hover:bg-[rgba(255,246,232,0.96)]"
                >
                  {detailsOpen ? "Skrýt detaily" : "Detaily"}
                </button>
              </div>

              <div
                id="details-panel"
                className={`overflow-hidden transition-all duration-300 ${detailsOpen ? "mt-[18px] max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="grid gap-[14px] sm:grid-cols-2">
                  <SummaryRow label="Částka" value={formattedAmount} />
                  <SummaryRow label="Poznámka" value={note.trim() || "Bez poznámky"} />
                  <SummaryRow label="Příjemce" value={config.recipient} />
                  <SummaryRow label="Účet" value={config.accountLabel} />
                  <SummaryRow label="VS" value={variableSymbolLabel} />
                  <SummaryRow label="Splatnost" value={dueDateLabel} />
                  <SummaryRow label="Formát" value={formatLabel} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-[18px]">
      <p className="text-[0.74rem] font-extrabold uppercase tracking-[0.2em] text-sand/50">{label}</p>
      <p className="mt-2 text-[0.95rem] leading-[1.55] text-sand/85">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-[#3c2a1c]/12 bg-[rgba(255,246,232,0.74)] px-[18px] py-4 sm:px-5">
      <p className="text-[0.74rem] font-extrabold uppercase tracking-[0.2em] text-[#826143]">{label}</p>
      <p className="mt-2 break-words text-base leading-[1.65] text-[#2f2118]">{value}</p>
    </div>
  );
}

function parseAmount(value: string) {
  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function createPaymentPayload({
  amount,
  currency,
  note,
  recipient,
  iban
}: {
  amount: number;
  currency: CurrencyCode;
  note: string;
  recipient: string;
  iban: string;
}) {
  const payload = [
    "SPD*1.0",
    `ACC:${iban}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency}`,
    `RN:${sanitizePaymentText(recipient, 35)}`
  ];

  if (note.trim()) {
    payload.push(`MSG:${sanitizePaymentText(note, 60)}`);
  }

  return payload.join("*");
}

function createQrGeneratorUrl({
  amount,
  iban,
  beneficiaryName,
  variableSymbol,
  paymentDueDate
}: {
  amount: number;
  iban: string;
  beneficiaryName: string;
  variableSymbol?: string;
  paymentDueDate?: string;
}) {
  const params = new URLSearchParams({
    iban,
    amount: amount.toFixed(2),
    currency: "EUR",
    size: "512",
    transparent: "false",
    mode: "none"
  });

  if (beneficiaryName) {
    params.set("beneficiary_name", beneficiaryName);
  }

  if (variableSymbol) {
    params.set("vs", variableSymbol);
  }

  if (paymentDueDate) {
    params.set("due_date", formatDateForQrGenerator(paymentDueDate));
  }

  return `https://api.qrgenerator.sk/by-square/pay/qr.png?${params.toString()}`;
}

function formatDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
  }

  const parts = value.split("-");

  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  return value;
}

function formatDateForQrGenerator(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value;
}

function sanitizePaymentText(value: string, limit: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function convertCzechAccountToIban(accountNumber: string, bankCode: string, prefix = "") {
  const account = accountNumber.padStart(10, "0");
  const accountPrefix = prefix.padStart(6, "0");
  const bban = `${bankCode}${accountPrefix}${account}`;
  const countryNumeric = "123500";
  const remainder = mod97(`${bban}${countryNumeric}`);
  const checkDigits = String(98 - remainder).padStart(2, "0");

  return `CZ${checkDigits}${bban}`;
}

function mod97(value: string) {
  let remainder = 0;

  for (const char of value) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }

  return remainder;
}
