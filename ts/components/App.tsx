import { LocalizationProvider } from "../contexts/localization.tsx"
import { FactoryField } from "./factory/FactoryField.tsx"
import { BugReportProvider } from "./common/BugReportProvider.tsx"

export function App() {

    return <>
        <LocalizationProvider>
            <BugReportProvider>
                <FactoryField />
            </BugReportProvider>
        </LocalizationProvider>
    </>
}
