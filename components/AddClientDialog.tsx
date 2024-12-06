import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useState } from "react";
import { Button } from "./ui/button";

export default function AddClientDialog({
  onSave = () => console.warn("La función onSave no fue proporcionada."),
}: {
  onSave?: (client: {
    firstName: string;
    lastName: string;
    plan: string;
    startDate: string;
    endDate: string;
    phone: string;
    emergencyPhone: string;
    email: string;
    hasPaid: boolean; // Nuevo campo agregado
  }) => void;
}) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [plan, setPlan] = useState("Básico");
  const [membershipStart, setMembershipStart] = useState("");
  const [membershipEnd, setMembershipEnd] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [emergencyPhone, setEmergencyPhone] = useState<string | undefined>(
    undefined
  );
  const [email, setEmail] = useState("");
  const [hasPaid, setHasPaid] = useState(false); // Estado para "¿Ha pagado?"
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    if (
      !name ||
      !lastName ||
      !membershipStart ||
      !membershipEnd ||
      !phone ||
      !emergencyPhone ||
      !email
    ) {
      setErrorMessage("Por favor, complete todos los campos.");
      return;
    }

    if (!isValidPhoneNumber(phone) || !isValidPhoneNumber(emergencyPhone)) {
      setErrorMessage("Por favor, ingrese números de teléfono válidos.");
      return;
    }

    const startDate = new Date(membershipStart);
    const endDate = new Date(membershipEnd);

    if (startDate >= endDate) {
      setErrorMessage("La fecha de inicio debe ser anterior a la fecha de fin.");
      return;
    }

    const newClient = {
      firstName: name,
      lastName: lastName,
      plan: plan,
      startDate: membershipStart,
      endDate: membershipEnd,
      phone: phone,
      emergencyPhone: emergencyPhone,
      email: email,
      hasPaid: hasPaid, // Incluye el estado de pago
    };

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el cliente. Intente nuevamente.");
      }

      const savedClient = await response.json();

      // Reinicia el formulario
      setName("");
      setLastName("");
      setPlan("Básico");
      setMembershipStart("");
      setMembershipEnd("");
      setPhone(undefined);
      setEmergencyPhone(undefined);
      setEmail("");
      setHasPaid(false); // Reinicia el estado de pago
      setErrorMessage("");

      onSave(savedClient);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setErrorMessage("No se pudo guardar el cliente. Intente nuevamente.");
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-lg w-96">
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <input
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
        placeholder="Apellidos"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="email"
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select
        className="w-full p-2 mb-4 border rounded bg-white text-black"
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
      >
        <option value="Básico" className="bg-white text-black">
          Mensual
        </option>
        <option value="Promoción Básica" className="bg-white text-black">
          Promoción Básica
        </option>
        <option value="Promoción Premium" className="bg-white text-black">
          Promoción Premium
        </option>
        <option value="Promoción VIP" className="bg-white text-black">
          Promoción VIP
        </option>
      </select>
      <label className="block text-sm font-bold mb-1">¿Ha pagado?</label>
      <input
        type="checkbox"
        checked={hasPaid}
        onChange={(e) => setHasPaid(e.target.checked)}
        className="mb-4"
      />
      <label className="block text-sm font-bold mb-1 text-black">
        Fecha de inicio de membresía
      </label>
      <input
        type="date"
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
        value={membershipStart}
        onChange={(e) => setMembershipStart(e.target.value)}
      />
      <label className="block text-sm font-bold mb-1 text-black">
        Fecha de fin de membresía
      </label>
      <input
        type="date"
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
        value={membershipEnd}
        onChange={(e) => setMembershipEnd(e.target.value)}
      />
      <PhoneInput
        defaultCountry="PE"
        placeholder="Número de teléfono principal"
        value={phone}
        onChange={setPhone}
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
      />
      <PhoneInput
        defaultCountry="PE"
        placeholder="Número de emergencia"
        value={emergencyPhone}
        onChange={setEmergencyPhone}
        className="w-full p-2 mb-4 border rounded bg-white text-black placeholder-gray-500"
      />
      <Button
        className="bg-yellow-400 text-black hover:bg-yellow-500 w-full"
        onClick={handleSave}
      >
        Guardar Cliente
      </Button>
    </div>
  );
}
