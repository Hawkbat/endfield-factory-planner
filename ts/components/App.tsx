import { LocalizationProvider } from "../contexts/localization.tsx"
import { FactoryField } from "./factory/FactoryField.tsx"

export function App() {

    return <>
        <LocalizationProvider>
            <FactoryField />
        </LocalizationProvider>
    </>
}
