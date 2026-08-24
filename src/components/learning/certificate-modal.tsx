// StatSkill AI — Competency Certificate Award Render

"use client";

import { useRef } from "react";
import { Award, Printer, X, Download, ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  designation: string;
  competencyName: string;
  competencyCode: string;
  levelEarned: number;
  dateEarned: string;
}

export default function CertificateModal({
  open,
  onOpenChange,
  employeeName,
  designation,
  competencyName,
  competencyCode,
  levelEarned,
  dateEarned,
}: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>MoSPI Competency Certificate - ${employeeName}</title>
              <style>
                body {
                  font-family: 'Times New Roman', Georgia, serif;
                  background-color: #fff;
                  color: #111;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                }
                .cert-container {
                  border: 10px double #a88a38;
                  padding: 40px;
                  width: 800px;
                  text-align: center;
                  position: relative;
                  background: #fbfbf6;
                }
                .cert-title {
                  font-size: 28px;
                  color: #0b1a30;
                  text-transform: uppercase;
                  margin-bottom: 5px;
                  letter-spacing: 2px;
                }
                .cert-subtitle {
                  font-size: 14px;
                  font-style: italic;
                  color: #777;
                  margin-bottom: 25px;
                }
                .cert-body {
                  font-size: 16px;
                  line-height: 1.6;
                  margin-bottom: 30px;
                }
                .name {
                  font-size: 24px;
                  font-weight: bold;
                  color: #a88a38;
                  border-bottom: 1px solid #ddd;
                  display: inline-block;
                  padding-bottom: 5px;
                  margin: 10px 0;
                }
                .badge-earned {
                  font-size: 14px;
                  font-weight: bold;
                  text-transform: uppercase;
                  background: #0b1a30;
                  color: #fff;
                  padding: 5px 12px;
                  border-radius: 4px;
                  display: inline-block;
                  margin-top: 10px;
                }
                .cert-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  margin-top: 50px;
                }
                .signature-block {
                  width: 180px;
                  text-align: center;
                  font-size: 12px;
                  border-top: 1px solid #777;
                  padding-top: 5px;
                }
                .seal-block {
                  width: 100px;
                  height: 100px;
                  border: 2px dashed #a88a38;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #a88a38;
                  font-weight: bold;
                  font-size: 11px;
                  text-transform: uppercase;
                  line-height: 1.2;
                }
              </style>
            </head>
            <body>
              <div class="cert-container">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const formattedDate = new Date(dateEarned).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 overflow-y-auto">
        <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-500" />
              Competency Award Certificate
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verifiable proof of statistical capability upgrade
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 pr-6">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 gap-1 text-xs">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        </DialogHeader>

        {/* Certificate Frame Area */}
        <div className="py-4 flex justify-center bg-muted/20 rounded-xl overflow-hidden p-4">
          <div
            ref={printRef}
            className="w-full max-w-[700px] border-8 border-double border-[#a88a38] p-8 sm:p-12 text-center bg-[#fbfbf6] text-slate-800 shadow-inner relative"
          >
            {/* Header Crest */}
            <div className="mx-auto w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center border-2 border-[#a88a38] mb-3">
              <Award className="w-6 h-6 text-[#a88a38]" />
            </div>

            {/* Titles */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-navy uppercase font-serif">
              Ministry of Statistics & Programme Implementation
            </h2>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 font-sans mt-0.5">
              Government of India
            </p>
            <div className="w-24 h-[1px] bg-[#a88a38] mx-auto my-3" />

            <h3 className="text-xs uppercase tracking-widest text-[#a88a38] font-sans font-bold">
              Certificate of Competency Upgrade
            </h3>
            <p className="text-xs italic text-slate-500 mt-2 font-serif">
              This is to officially certify and record that
            </p>

            {/* Recipient Name */}
            <div className="my-3">
              <p className="text-lg sm:text-xl font-bold font-serif text-navy underline decoration-[#a88a38]/40 underline-offset-4">
                {employeeName}
              </p>
              <p className="text-[10px] text-slate-500 font-sans tracking-wide mt-1">
                {designation}
              </p>
            </div>

            <p className="text-xs italic text-slate-500 max-w-lg mx-auto font-serif leading-relaxed">
              has successfully qualified and demonstrated intermediate execution skills matching designation expectations for:
            </p>

            {/* Competency Badge */}
            <div className="my-4">
              <p className="text-sm sm:text-base font-bold text-[#a88a38] font-serif">
                {competencyName} ({competencyCode})
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1 bg-navy text-white text-[10px] font-sans font-bold px-3 py-1 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                QUALIFIED LEVEL {levelEarned} (INTERMEDIATE)
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans tracking-wider uppercase">
              Granted on {formattedDate}
            </p>

            {/* Bottom Seal & Signatures */}
            <div className="mt-8 flex justify-between items-end gap-6 text-left">
              {/* Date Column */}
              <div className="w-[150px] border-t border-slate-300 pt-1 font-serif text-[10px] text-slate-500">
                <p className="font-sans font-bold text-slate-700">DATE ISSUED</p>
                <p>{formattedDate}</p>
              </div>

              {/* Gold Seal Circle */}
              <div className="w-16 h-16 rounded-full border-2 border-double border-[#a88a38] bg-amber-50 flex flex-col items-center justify-center text-[7px] text-[#a88a38] font-sans font-bold text-center leading-tight shadow-sm flex-shrink-0">
                <span>OFFICIAL</span>
                <span className="text-[8px] font-extrabold text-navy">MoSPI</span>
                <span>SEAL</span>
              </div>

              {/* Signature Column */}
              <div className="w-[150px] border-t border-slate-300 pt-1 font-serif text-[10px] text-slate-500 text-right">
                <p className="font-sans font-bold text-slate-700">ISSUED BY</p>
                <p>StatSkill AI Engine</p>
                <p className="text-[8px] text-slate-400 font-mono">ID: SEC-C{competencyCode}-{levelEarned}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
