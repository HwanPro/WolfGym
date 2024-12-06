"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EditProductDialog from "@/components/EditProductDialog";
import Image from "next/image";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import AddProductDialog from "@/components/AddProductDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "react-toastify";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  imageUrl: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products"); // Cambié "/api/products/add" a "/api/products"
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const data = await response.json();
      const formattedProducts = data.map((product: any) => ({
        id: product.item_id,
        name: product.item_name,
        description: product.item_description,
        price: product.item_price,
        discount: product.item_discount,
        stock: product.item_stock,
        imageUrl: product.item_image_url || "/placeholder-image.png", // Fallback en caso de no tener imagen
      }));
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Manejo de errores con comprobación de contenido JSON
        const errorData = await response.json().catch(() => null); // Maneja respuestas vacías
        console.error("Error al eliminar el producto:", errorData);
        throw new Error(errorData?.error || "Error al eliminar el producto");
      }

      toast.dismiss();
      toast.success("Producto eliminado correctamente");
      fetchProducts(); // Refresca la lista de productos
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      toast.error(error.message || "Error al eliminar el producto");
    } finally {
      setShowConfirmDialog(false);
      setDeleteProductId(null);
    }
  };

  const handleEditSave = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`/api/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Manejo de JSON inválido
        console.error("Error al actualizar el producto:", errorData);
        throw new Error(errorData.error || "Error al actualizar el producto");
      }

      const data = await response.json();
      toast.dismiss();
      toast.success("Producto actualizado correctamente");
      fetchProducts();
      setSelectedProduct(null); // Cierra el diálogo después de guardar
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  if (loading) {
    return <p className="text-center text-yellow-400">Cargando productos...</p>;
  }

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-yellow-400">
          Gestión de Productos
        </h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md text-black"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="text-yellow-400 text-center">
                Agregar Producto
              </DialogTitle>
              <AddProductDialog onSave={fetchProducts} />
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Volver al Panel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center text-center transform transition-all hover:scale-105 hover:shadow-2xl max-w-[220px]"
          >
            {product.discount > 0 && (
              <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs px-2 py-1 font-bold rounded-tr-lg">
                {product.discount.toFixed(2)}% OFF
              </div>
            )}
            <Image
              src={session?.user?.image || "/default-avatar.png"}
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover"
              width={32}
              height={32}
            />
            <h2 className="text-sm font-bold text-black">{product.name}</h2>
            <p className="text-xs text-gray-500">{product.description}</p>
            <p className="text-yellow-400 font-bold">
              S/.{" "}
              {(
                product.price -
                (product.price * product.discount) / 100
              ).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            <div className="flex gap-2 mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Editar
                  </Button>
                </DialogTrigger>
                {selectedProduct && selectedProduct.id === product.id && (
                  <DialogContent>
                    <DialogTitle className="text-yellow-400 text-center">
                      Editar Producto
                    </DialogTitle>
                    <EditProductDialog
                      product={selectedProduct}
                      onSave={handleEditSave}
                      onClose={() => setSelectedProduct(null)}
                    />
                  </DialogContent>
                )}
              </Dialog>
              <Button
                onClick={() => {
                  setDeleteProductId(product.id);
                  setShowConfirmDialog(true);
                }}
                className="bg-red-500 text-white hover:bg-red-600 text-xs"
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          message="¿Estás seguro de que deseas eliminar este producto?"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowConfirmDialog(false);
            setDeleteProductId(null);
          }}
        />
      )}
    </div>
  );
}
