// ReductionsTab.jsx – Third tab of the guided tour, handling reduction-related inputs.
// Contains other qualifications (excluding academic) and shows notification for reductions over 6 months.
import { useMemo } from "react";
import OtherQualificationReductions from "../../components/OtherQualificationReductions.jsx";
import Button from "../../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";
import { summarizeQualificationSelection } from "../../components/qualificationOptions.js";

/**
 * ReductionsTab component - Third step of the guided tour.
 *
 * Handles other qualification reductions (excluding academic).
 * Shows notification if qualification reduction exceeds 6 months.
 *
 * @param {Object} props - Component props
 * @param {string[]} props.otherQualificationSelection - Array of selected other qualification IDs
 * @param {Function} props.onOtherQualificationChange - Callback for other qualification change
 * @param {Function} props.onBack - Callback when Back button is clicked
 * @param {Function} props.onNext - Callback when Next button is clicked
 */
export default function ReductionsTab({
  otherQualificationSelection = [],
  onOtherQualificationChange,
  onBack,
  onNext,
}) {
  const { t } = useTranslation();

  // Calculate qualification reduction total to check if notification should be shown
  const qualificationTotal = useMemo(
    () => summarizeQualificationSelection(otherQualificationSelection),
    [otherQualificationSelection]
  );

  // Show notification if qualification reduction exceeds 6 months
  const showNotification = qualificationTotal.rawTotal > 6;

  return (
    <div
      role="tabpanel"
      id="tabpanel-reductions"
      aria-labelledby="tab-reductions"
      className="space-y-6"
    >
      <div className="space-y-4">
        <OtherQualificationReductions
          value={otherQualificationSelection}
          onChange={onOtherQualificationChange}
        />
        {showNotification && (
          <div className="w-full max-w-sm mx-auto">
            <p className="text-xs text-amber-700" role="note">
              {t("qualifications.legalHint")}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary" size="md">
          ← {t("tour.navigation.back")}
        </Button>
        <Button onClick={onNext} variant="primary" size="md">
          {t("tour.navigation.next")} →
        </Button>
      </div>
    </div>
  );
}
