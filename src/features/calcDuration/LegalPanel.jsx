import { useTranslation } from "react-i18next";
import Dialog from "../../components/ui/Dialog";
import LegalContent from "../../components/legal/LegalContent.jsx";

export default function LegalPanel({ onClose }) {
  const { t } = useTranslation();

  return (
    <Dialog
      title={t("legal.title")}
      isOpen
      onClose={onClose}
      maxWidth="max-w-4xl"
      bodyClassName="max-h-[70vh] overflow-y-auto px-6 py-5"
      closeLabel={t("transparency.close")}
    >
      <LegalContent />
    </Dialog>
  );
}
