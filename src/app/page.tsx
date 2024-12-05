"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Dumbbell, Users, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import CulqiPaymentForm, { CulqiPaymentFormHandle } from "@/components/CulqiPaymentForm";

export default function WolfGymLanding() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const router = useRouter(); // Hook para redirigir al usuario
  const { data: session, status } = useSession();
  const culqiRef = useRef<CulqiPaymentFormHandle>(null);

  const handleLogin = () => {
    router.push("/auth/login"); // Redirigir a la página de inicio de sesión
  };

  const handleProducts = () => {
    router.push("/products/public"); // Redirigir a la página de productos
  };

  const handlePaymentSuccess = (charge: any) => {
    alert("Pago realizado con éxito");
    // Aquí puedes manejar la lógica post-pago, como actualizar el estado del usuario
    setModalAbierto(false);
  };

  const handlePaymentError = (error: string) => {
    alert(`Error en el pago: ${error}`);
  };

  // Obtener el email del usuario (implementa la lógica de autenticación si es necesario)
  const userEmail = session?.user?.email || "cliente@example.com"; // Reemplaza esto con el email real del usuario

  const handlePlanSelection = (plan: { amount: number; description: string }) => {
    if (status === "authenticated") {
      // Usuario autenticado, proceder con el pago
      culqiRef.current?.openCulqi({
        amount: plan.amount,
        description: plan.description,
        email: userEmail,
      });
      setModalAbierto(false);
    } else {
      // Usuario no autenticado, redirigir a inicio de sesión
      signIn(); // Esto abrirá la página de inicio de sesión de next-auth
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-white">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-black">
        <Link className="flex items-center justify-center" href="/">
          <Image
            src="/uploads/images/logo.jpg"
            alt="Wolf Gym Logo"
            width={100}
            height={50}
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            onClick={handleLogin}
            className="text-sm font-medium hover:text-yellow-400 underline-offset-4"
          >
            Inicia sesión
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-yellow-400">
                  Bienvenido a Wolf Gym
                </h1>
                <p className="mx-auto max-w-[700px] text-white md:text-xl">
                  Libera tu lobo interior. Únete a la manada y transforma tu
                  cuerpo y mente.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                  onClick={() => setModalAbierto(true)}
                >
                  Comenzar
                </Button>
                <Button
                  variant="outline"
                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={handleProducts} // Aquí llamamos a la función que redirige a "/products"
                >
                  Ver Productos
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-white text-black"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-black">
              Nuestras Características
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              <Card className="bg-black text-white">
                <CardHeader>
                  <Dumbbell className="w-12 h-12 mb-4 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Equipos de Última Tecnología
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Acceso a equipamiento de fitness.</p>
                </CardContent>
              </Card>
              <Card className="bg-black text-white">
                <CardHeader>
                  <Users className="w-12 h-12 mb-4 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Entrenadores Expertos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Guía personalizada por profesionales certificados.</p>
                </CardContent>
              </Card>
              <Card className="bg-black text-white">
                <CardHeader>
                  <Calendar className="w-12 h-12 mb-4 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Clases Diversas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Proximamente....</p>
                </CardContent>
              </Card>
              <Card className="bg-black text-white">
                <CardHeader>
                  <Clock className="w-12 h-12 mb-4 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Horarios de Apertura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm">
                    <strong>De lunes a viernes:</strong> 6 AM - 9 PM
                  </p>
                  <p className="text-white text-sm">
                    <strong>Sábados:</strong> 6 AM - 8 PM
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="w-full py-10 md:py-20 lg:py-28 bg-black"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-yellow-400">
              Planes de Membresía
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white text-black flex flex-col">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-xl">
                    Plan Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4 text-black">
                    S/60.00/Mes
                  </div>
                  <ul className="space-y-2 text-gray-700"></ul>
                </CardContent>
                <Button className="w-full mt-auto bg-yellow-400 text-black hover:bg-yellow-500">
                  Elegir Plan
                </Button>
              </Card>
              <Card className="bg-white text-black flex flex-col">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-xl">
                    Básico
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Para personas que van al gimnasio de forma casual
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4 text-black">
                    S/150.00/Mes
                  </div>
                  <ul className="space-y-2 text-gray-700"></ul>
                </CardContent>
                <Button className="w-full mt-auto bg-yellow-400 text-black hover:bg-yellow-500">
                  Elegir Plan
                </Button>
              </Card>
              <Card className="bg-white text-black flex flex-col">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-xl">Pro</CardTitle>
                  <CardDescription className="text-gray-600">
                    Para entusiastas dedicados al fitness
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4 text-black">
                    S/100.00/Mes
                  </div>
                  <ul className="space-y-2 text-gray-700"></ul>
                </CardContent>
                <Button className="w-full mt-auto bg-yellow-400 text-black hover:bg-yellow-500">
                  Elegir Plan
                </Button>
              </Card>
              <Card className="bg-white text-black flex flex-col">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-xl">
                    Elite
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Para aquellos que buscan resultados máximos
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4 text-black">
                    S/350.00/Año
                  </div>
                  <ul className="space-y-2 text-gray-700"></ul>
                </CardContent>
                <Button className="w-full mt-auto bg-yellow-400 text-black hover:bg-yellow-500">
                  Elegir Plan
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="schedule"
          className="w-full py-12 md:py-24 lg:py-32 bg-white text-black"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-black">
              Horario de Clases
            </h2>
            <p className="text-lg text-center text-gray-600 mb-8">
              ¡Próximamente actualizaremos nuestro horario con más sesiones de
              Box y Baile!
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-yellow-400">Hora</TableHead>
                  <TableHead className="text-yellow-400">Lunes</TableHead>
                  <TableHead className="text-yellow-400">Miércoles</TableHead>
                  <TableHead className="text-yellow-400">Viernes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-gray-500">6:00 PM</TableCell>
                  <TableCell className="text-black font-bold">Box</TableCell>
                  <TableCell className="text-black font-bold">Baile</TableCell>
                  <TableCell className="text-black font-bold">Box</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-center mt-12 text-gray-600">
              <span className="text-yellow-400 font-bold">Nota:</span> Estamos
              trabajando en más horarios y actividades emocionantes para ti.
              ¡Mantente al tanto!
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="w-full py-12 md:py-24 lg:py-32 bg-black"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-yellow-400">
              Contáctanos
            </h2>
            <div className="mx-auto max-w-lg">
              <form className="space-y-4">
                <Input placeholder="Nombre" className="bg-white text-black" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="bg-white text-black"
                />
                <Input
                  type="tel"
                  placeholder="Telefono"
                  className="bg-white text-black"
                />
                <Button
                  type="submit"
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-yellow-400">
        <p className="text-xs text-black">
          © 2024 Wolf Gym. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex mx-auto sm:gap-6">
          <Link
            className="text-xs hover:text-yellow-400 underline-offset-4 text-black"
            href="#"
          >
            Términos del Servicio
          </Link>
          <Link
            className="text-xs hover:text-yellow-400 underline-offset-4 text-black"
            href="#"
          >
            Privacidad
          </Link>
        </nav>
        <div className="flex mt-4 sm:mt-0 gap-4">
          <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-yellow-400"
            >
              <title>Meta</title>
              <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303z" />
            </svg>
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-yellow-400"
            >
              <title>Instagram</title>
              <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636 .552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.17-.264-1.805.408-2.2282-.216-.5604-.4763-.96-.8954-1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.848.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
            </svg>
          </Link>
          <Link
            href="https://api.whatsapp.com/send?phone=51971474484"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-yellow-400"
            >
              <title>WhatsApp</title>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </Link>
        </div>

        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="bg-white text-black rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">
                Elige tu plan de suscripción
              </DialogTitle>
              <DialogDescription className="text-gray-500 mb-6">
                Selecciona el plan que mejor se adapte a tus necesidades de
                entrenamiento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <Button
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm py-2 px-4 rounded"
                onClick={() => handlePlanSelection({ amount: 6000, description: "Plan Mensual - S/60.00/mes" })}
              >
                Plan Mensual - S/60.00/mes
              </Button>
              <Button
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm py-2 px-4 rounded"
                onClick={() => handlePlanSelection({ amount: 15000, description: "Plan Básico - S/150.00/mes" })}
              >
                Plan Básico - S/150.00/mes
              </Button>
              <Button
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm py-2 px-4 rounded"
                onClick={() => handlePlanSelection({ amount: 10000, description: "Plan Pro - S/100.00/mes" })}
              >
                Plan Pro - S/100.00/mes
              </Button>
              <Button
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm py-2 px-4 rounded"
                onClick={() => handlePlanSelection({ amount: 35000, description: "Plan Elite - S/350.00/Año" })}
              >
                Plan Elite - S/350.00/Año
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Componente CulqiPaymentForm */}
        <CulqiPaymentForm ref={culqiRef} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
      </footer>
    </div>
  );
}
