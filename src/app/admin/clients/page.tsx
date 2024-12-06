// src/app/admin/clients/dashboard/page.tsx

"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import AddClientDialog from "@/components/AddClientDialog";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define el tipo para los datos del cliente
interface Client {
  id: string;
  name: string;
  lastName: string;
  plan: string;
  membershipStart: string;
  membershipEnd: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Fetch Clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) throw new Error("Error al obtener los clientes");
        const data = await response.json();

        // Map API fields to frontend-friendly names
        const sanitizedData: Client[] = data.map((client: any) => ({
          id: client.profile_id,
          name: client.profile_first_name || "Sin nombre",
          lastName: client.profile_last_name || "Sin apellido",
          plan: client.profile_plan || "Sin plan",
          membershipStart: client.profile_start_date
            ? new Date(client.profile_start_date).toLocaleDateString()
            : "Sin fecha",
          membershipEnd: client.profile_end_date
            ? new Date(client.profile_end_date).toLocaleDateString()
            : "Sin fecha",
        }));

        setClients(sanitizedData);
        setFilteredClients(sanitizedData);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast.error("Error al cargar clientes. Inténtelo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Search Filter
  useEffect(() => {
    const filter = clients.filter((client) =>
      `${client.name} ${client.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filter);
  }, [searchQuery, clients]);

  // Handle Delete Click
  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
    setShowConfirm(true);
  };

  // Confirm Delete Logic
  const confirmDelete = async () => {
    if (!clientToDelete) {
      toast.error("No se pudo identificar al cliente a eliminar.");
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el cliente");
      }

      setClients((prev) =>
        prev.filter((client) => client.id !== clientToDelete)
      );
      setFilteredClients((prev) =>
        prev.filter((client) => client.id !== clientToDelete)
      );
      toast.success("Cliente eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar cliente. Inténtelo más tarde.");
    } finally {
      setShowConfirm(false);
      setClientToDelete(null);
    }
  };

  // Loading State
  if (loading) {
    return <p className="text-center text-yellow-400">Cargando clientes...</p>;
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">
          Gestión de Clientes
        </h1>
        <Link
          href="/admin/dashboard"
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
        >
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          className="p-2 rounded border w-full max-w-sm"
          placeholder="Buscar cliente por nombre o apellido"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-4 bg-yellow-400 text-black hover:bg-yellow-500">
              Añadir Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <DialogTitle className="text-black text-lg font-bold mb-4">
              Registrar Nuevo Cliente
            </DialogTitle>
            <AddClientDialog
              onSave={(newClient) => {
                const clientWithId: Client = {
                  ...newClient,
                  id: Math.random().toString(36).substr(2, 9), // Generar un ID únicoF
                  firstName: newClient.firstName,
                  lastName: newClient.lastName,
                  plan: newClient.plan,
                  startDate: newClient.startDate,
                  endDate: newClient.endDate,
                  phone: newClient.phone,
                  emergencyPhone: newClient.emergencyPhone,
                  email: newClient.email,
                  hasPaid: newClient.hasPaid,
                };

                // Actualiza las listas de clientes
                setClients((prev) => [...prev, clientWithId]);
                setFilteredClients((prev) => [...prev, clientWithId]);
                toast.success("Cliente agregado con éxito.");
              }}
            />
            
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-yellow-400">Nombre</TableHead>
            <TableHead className="text-yellow-400">Apellidos</TableHead>
            <TableHead className="text-yellow-400">Plan</TableHead>
            <TableHead className="text-yellow-400">Fecha de Inicio</TableHead>
            <TableHead className="text-yellow-400">Fecha de Fin</TableHead>
            <TableHead className="text-yellow-400">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.lastName}</TableCell>
                <TableCell>{client.plan}</TableCell>
                <TableCell>{client.membershipStart}</TableCell>
                <TableCell>{client.membershipEnd}</TableCell>
                <TableCell>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleDeleteClick(client.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay clientes disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showConfirm && (
        <ConfirmDialog
          message="¿Estás seguro de que deseas eliminar este cliente?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
