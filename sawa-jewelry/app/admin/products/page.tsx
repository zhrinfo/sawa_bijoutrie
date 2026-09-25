"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/AdminLayout";

type AuthUser = { fullName?: string; roles?: string[] };
type Product = {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: string;
  stock: number;
  sales: number;
  status: "Publié" | "Brouillon";
  image: string;
  description?: string;
  brand?: string;
  images?: { imageUrl: string; primaryImage?: boolean; sortOrder?: number }[];
  sizes?: { name: string; sizeId?: number; stockQuantity: number }[];
  colors?: string[];
  colorIds?: number[];
};
type SizeEntry = { sizeId: string; stockQuantity: string };
type NewProduct = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  brand: string;
  imageUrls: string[];
  categoryId: string;
  sizes: SizeEntry[];
  colorIds: string;
};
type CatalogOption = { id: number; name: string };
type ProductReview = {
  id?: number;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  clientId?: number;
  clientName?: string;
  productId?: number;
  productName?: string;
};
type ApiProduct = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  brand?: string;
  imageUrl?: string;
  active?: boolean;
  category?: { id?: number; name?: string };
  images?: { imageUrl: string; primaryImage?: boolean; sortOrder?: number }[];
  sizes?: { size?: { id?: number; name?: string }; stockQuantity: number }[];
  colors?: { id?: number; name?: string }[];
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Bague Diamant Éternité",
    category: "Bagues",
    price: "12 490 DH",
    stock: 24,
    sales: 184,
    status: "Publié",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=160&q=80",
  },
  {
    id: 2,
    name: "Collier Or 18K",
    category: "Colliers",
    price: "8 750 DH",
    stock: 3,
    sales: 142,
    status: "Publié",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&q=80",
  },
  {
    id: 3,
    name: "Bracelet Riviera",
    category: "Bracelets",
    price: "5 200 DH",
    stock: 46,
    sales: 118,
    status: "Publié",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=160&q=80",
  },
  {
    id: 4,
    name: "Boucles Émeraude",
    category: "Boucles d’oreilles",
    price: "6 890 DH",
    stock: 18,
    sales: 96,
    status: "Publié",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=160&q=80",
  },
  {
    id: 5,
    name: "Montre Luxury Gold",
    category: "Montres",
    price: "18 900 DH",
    stock: 0,
    sales: 74,
    status: "Publié",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=160&q=80",
  },
  {
    id: 6,
    name: "Bague Saphir Royal",
    category: "Bagues",
    price: "9 800 DH",
    stock: 8,
    sales: 61,
    status: "Brouillon",
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=160&q=80",
  },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [status, setStatus] = useState("Tous les statuts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [cardImageIndexes, setCardImageIndexes] = useState<Record<number, number>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    brand: "",
    imageUrls: [""],
    categoryId: "",
    sizes: [],
    colorIds: "",
  });
  const [catalogOptions, setCatalogOptions] = useState({
    categories: [] as CatalogOption[],
    sizes: [] as CatalogOption[],
    colors: [] as CatalogOption[],
  });

  useEffect(() => {
    async function loadProducts() {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      try {
        const values: ApiProduct[] = [];
        let page = 0;
        let isLastPage = false;

        // Le backend paginant les produits, on parcourt toutes les pages pour tout afficher.
        while (!isLastPage) {
          const response = await fetch(
            `http://localhost:8080/api/products`,
            { headers },
          );
          if (!response.ok)
            throw new Error("Impossible de charger les produits.");

          const data = await response.json();
          const pageValues = (Array.isArray(data)
            ? data
            : (data.content ?? data.data ?? [])) as ApiProduct[];

          values.push(...pageValues);
          isLastPage =
            Array.isArray(data) ||
            data.last === true ||
            pageValues.length === 0 ||
            pageValues.length < 100;
          page += 1;
        }

        setProducts(
          values.map((product) => {
            const sortedImages = [...(product.images ?? [])].sort(
              (first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0),
            );
            const primaryImage =
              sortedImages.find((image) => image.primaryImage)?.imageUrl ??
              sortedImages[0]?.imageUrl ??
              product.imageUrl ??
              "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=640&q=80";

            return {
              id: product.id,
              name: product.name,
              description: product.description,
              brand: product.brand,
              category: product.category?.name ?? "Sans catégorie",
              categoryId: product.category?.id,
              price: `${Number(product.price).toFixed(2)} DH`,
              stock: product.stockQuantity ?? 0,
              sales: 0,
              status: product.active === true ? ("Publié" as const) : ("Brouillon" as const),
              image: primaryImage,
              images: sortedImages,
              sizes: (product.sizes ?? []).map((size) => ({
                name: size.size?.name ?? "Taille sans nom",
                sizeId: size.size?.id,
                stockQuantity: size.stockQuantity,
              })),
              colors: (product.colors ?? [])
                .map((color) => color.name)
                .filter((name): name is string => Boolean(name)),
              colorIds: (product.colors ?? [])
                .map((color) => color.id)
                .filter((id): id is number => id !== undefined),
            };
          }),
        );
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Produits indisponibles",
          text:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue.",
          confirmButtonColor: "#013d11",
        });
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("authUser");
    if (!storedUser) return router.replace("/login");
    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser;
      if (!parsedUser.roles?.includes("ROLE_ADMIN"))
        return router.replace(parsedUser.roles?.includes("ROLE_SOUS_ADMIN") ? "/admin/orders" : "/products");
      setUser(parsedUser);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!selectedProduct) {
      setProductReviews([]);
      setReviewsError("");
      return;
    }

    let isCurrentRequest = true;
    const selectedProductId = selectedProduct.id;

    async function loadProductReviews() {
      setReviewsLoading(true);
      setReviewsError("");

      try {
        const token = window.localStorage
          .getItem("token")
          ?.replace(/^Bearer\s+/i, "");
        const response = await fetch(
          `http://localhost:8080/api/reviews/product/${selectedProductId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        if (!response.ok) throw new Error("Impossible de charger les avis.");

        const data = await response.json();
        const reviews = (Array.isArray(data)
          ? data
          : (data.reviews ?? data.content ?? data.data ?? [])) as ProductReview[];

        if (isCurrentRequest) setProductReviews(reviews);
      } catch {
        if (isCurrentRequest) {
          setProductReviews([]);
          setReviewsError("Impossible de charger les avis pour le moment.");
        }
      } finally {
        if (isCurrentRequest) setReviewsLoading(false);
      }
    }

    loadProductReviews();

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedProduct]);

  useEffect(() => {
    async function loadCatalogOptions() {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      try {
        const [categoriesResponse, sizesResponse, colorsResponse] =
          await Promise.all([
            fetch("http://localhost:8080/api/categories", { headers }),
            fetch("http://localhost:8080/api/sizes", { headers }),
            fetch("http://localhost:8080/api/colors", { headers }),
          ]);

        if (!categoriesResponse.ok || !sizesResponse.ok || !colorsResponse.ok)
          throw new Error("Impossible de charger les options du catalogue.");

        const normalizeOptions = async (
          response: Response,
        ): Promise<CatalogOption[]> => {
          const data = await response.json();
          const values = (
            Array.isArray(data) ? data : (data.content ?? data.data ?? [])
          ) as Array<{ id?: number; name?: string }>;
          const uniqueValues = Array.from(
            new Map(
              values
                .filter(
                  (value): value is { id: number; name: string } =>
                    value.id !== undefined && Boolean(value.name),
                )
                .map((value) => [value.id, value]),
            ).values(),
          );

          return uniqueValues.map((value) => ({
            id: value.id,
            name: value.name,
          }));
        };

        setCatalogOptions({
          categories: await normalizeOptions(categoriesResponse),
          sizes: await normalizeOptions(sizesResponse),
          colors: await normalizeOptions(colorsResponse),
        });
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Options indisponibles",
          text: "Les catégories, tailles et couleurs ne peuvent pas être chargées.",
          confirmButtonColor: "#013d11",
        });
      }
    }

    loadCatalogOptions();
  }, []);

  const categories = [
    "Toutes",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "Toutes" || product.category === category) &&
          (status === "Tous les statuts" || product.status === status),
      ),
    [category, products, query, status],
  );
  const displayName = user?.fullName || "Administrateur";

  function logout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("authUser");
    router.push("/login");
  }

  function updateQuery(value: string) {
    setQuery(value);
  }
  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
  }

  function updateImageUrl(index: number, value: string) {
    setNewProduct((current) => ({
      ...current,
      imageUrls: current.imageUrls.map((imageUrl, imageIndex) =>
        imageIndex === index ? value : imageUrl,
      ),
    }));
  }

  function addImageUrl() {
    setNewProduct((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, ""],
    }));
  }

  function removeImageUrl(index: number) {
    setNewProduct((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
  }

  function addSize() {
    setNewProduct((current) => ({
      ...current,
      sizes: [...current.sizes, { sizeId: "", stockQuantity: "" }],
    }));
  }

  function updateSize(index: number, field: keyof SizeEntry, value: string) {
    setNewProduct((current) => ({
      ...current,
      sizes: current.sizes.map((size, sizeIndex) =>
        sizeIndex === index ? { ...size, [field]: value } : size,
      ),
    }));
  }

  function removeSize(index: number) {
    setNewProduct((current) => ({
      ...current,
      sizes: current.sizes.filter((_, sizeIndex) => sizeIndex !== index),
    }));
  }

  function updateEditingImage(index: number, imageUrl: string) {
    setEditingProduct((current) => {
      if (!current) return current;
      const images = getProductImages(current).map((currentImage, imageIndex) =>
        imageIndex === index ? imageUrl : currentImage,
      );
      return {
        ...current,
        image: images[0] ?? current.image,
        images: images.slice(1).map((url, imageIndex) => ({
          imageUrl: url,
          primaryImage: false,
          sortOrder: imageIndex + 1,
        })),
      };
    });
  }

  function addEditingImage() {
    setEditingProduct((current) =>
      current
        ? {
            ...current,
            images: [
              ...(current.images ?? []),
              { imageUrl: "", primaryImage: false },
            ],
          }
        : current,
    );
  }

  function removeEditingImage(index: number) {
    setEditingProduct((current) => {
      if (!current || index === 0) return current;
      const images = getProductImages(current).filter(
        (_, imageIndex) => imageIndex !== index,
      );
      return {
        ...current,
        image: images[0] ?? current.image,
        images: images.slice(1).map((url, imageIndex) => ({
          imageUrl: url,
          primaryImage: false,
          sortOrder: imageIndex + 1,
        })),
      };
    });
  }

  function addEditingSize() {
    setEditingProduct((current) =>
      current
        ? {
            ...current,
            sizes: [
              ...(current.sizes ?? []),
              { name: "", sizeId: undefined, stockQuantity: 0 },
            ],
          }
        : current,
    );
  }

  function updateEditingSize(
    index: number,
    field: "sizeId" | "stockQuantity",
    value: string,
  ) {
    setEditingProduct((current) =>
      current
        ? {
            ...current,
            sizes: (current.sizes ?? []).map((size, sizeIndex) =>
              sizeIndex === index
                ? {
                    ...size,
                    [field]: field === "sizeId" ? Number(value) : Number(value),
                    ...(field === "sizeId"
                      ? {
                          name:
                            catalogOptions.sizes.find(
                              (option) => option.id === Number(value),
                            )?.name ?? "Taille sans nom",
                        }
                      : {}),
                  }
                : size,
            ),
          }
        : current,
    );
  }

  function removeEditingSize(index: number) {
    setEditingProduct((current) =>
      current
        ? {
            ...current,
            sizes: (current.sizes ?? []).filter(
              (_, sizeIndex) => sizeIndex !== index,
            ),
          }
        : current,
    );
  }

  function getProductImages(product: Product) {
    return Array.from(
      new Set([
        product.image,
        ...(product.images ?? []).map((image) => image.imageUrl),
      ]),
    );
  }

  function changeCardImage(
    event: React.MouseEvent,
    product: Product,
    direction: "previous" | "next",
  ) {
    event.stopPropagation();
    const images = getProductImages(product);
    if (images.length < 2) return;

    setCardImageIndexes((current) => {
      const currentIndex = current[product.id] ?? 0;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % images.length
          : (currentIndex - 1 + images.length) % images.length;

      return { ...current, [product.id]: nextIndex };
    });
  }

  function changeSelectedImage(direction: "previous" | "next") {
    if (!selectedProduct) return;
    const images = [
      selectedProduct.image,
      ...(selectedProduct.images ?? [])
        .map((image) => image.imageUrl)
        .filter((imageUrl) => imageUrl !== selectedProduct.image),
    ];
    if (images.length < 2) return;

    const currentIndex = Math.max(
      0,
      images.indexOf(selectedImage ?? selectedProduct.image),
    );
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % images.length
        : (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[nextIndex]);
  }

  async function deleteProduct(id: number) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Supprimer ce produit ?",
      text: "Cette action est irréversible.",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#bd755f",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("La suppression du produit a échoué.");

      setProducts((current) => current.filter((product) => product.id !== id));
      setOpenMenu(null);
      await Swal.fire({
        icon: "success",
        title: "Produit supprimé",
        confirmButtonColor: "#013d11",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Suppression impossible",
        text:
          error instanceof Error ? error.message : "Une erreur est survenue.",
        confirmButtonColor: "#013d11",
      });
    }
  }

  async function toggleProductActive(id: number, currentStatus: Product["status"]) {
    const nextActive = currentStatus !== "Publié";
    setOpenMenu(null);

    try {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const response = await fetch(
        `http://localhost:8080/api/products/${id}/active?active=${nextActive}`,
        {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!response.ok)
        throw new Error("Le changement de statut a échoué.");

      setProducts((current) =>
        current.map((product) =>
          product.id === id
            ? { ...product, status: nextActive ? "Publié" : "Brouillon" }
            : product,
        ),
      );
      await Swal.fire({
        icon: "success",
        title: nextActive ? "Produit activé" : "Produit désactivé",
        confirmButtonColor: "#013d11",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Statut inchangé",
        text:
          error instanceof Error ? error.message : "Une erreur est survenue.",
        confirmButtonColor: "#013d11",
      });
    }
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;

    try {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const price = Number(
        editingProduct.price.replace(/DH$/i, "").replace(/\s/g, "").trim(),
      );
      const imageUrls = getProductImages(editingProduct)
        .map((imageUrl) => imageUrl.trim())
        .filter(Boolean);
      if (!Number.isFinite(price)) throw new Error("Saisissez un prix valide.");
      if (imageUrls.length === 0)
        throw new Error("Ajoutez au moins une image au produit.");
      if (!editingProduct.categoryId)
        throw new Error("Sélectionnez une catégorie.");
      const sizes = (editingProduct.sizes ?? []).map((size) => {
        if (size.sizeId === undefined || !Number.isFinite(size.sizeId))
          throw new Error("Chaque taille doit être sélectionnée.");
        if (!Number.isFinite(size.stockQuantity) || size.stockQuantity < 0)
          throw new Error("La quantité de chaque taille doit être valide.");
        return {
          sizeId: size.sizeId,
          stockQuantity: size.stockQuantity,
        };
      });
      const response = await fetch(
        `http://localhost:8080/api/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description ?? "",
            price,
            stockQuantity: editingProduct.stock,
            brand: editingProduct.brand ?? "",
            imageUrl: imageUrls[0],
            categoryId: editingProduct.categoryId,
            images: imageUrls.map((imageUrl, index) => ({
              imageUrl,
              primaryImage: index === 0,
              sortOrder: index,
            })),
            sizes,
            colorIds: Array.from(new Set(editingProduct.colorIds ?? [])),
          }),
        },
      );
      if (!response.ok) throw new Error("La modification du produit a échoué.");

      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id ? editingProduct : product,
        ),
      );
      setEditingProduct(null);
      await Swal.fire({
        icon: "success",
        title: "Produit modifié",
        confirmButtonColor: "#013d11",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Modification impossible",
        text:
          error instanceof Error ? error.message : "Une erreur est survenue.",
        confirmButtonColor: "#013d11",
      });
    }
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = window.localStorage
        .getItem("token")
        ?.replace(/^Bearer\s+/i, "");
      const stockQuantity = Number(newProduct.stockQuantity);
      const price = Number(newProduct.price);
      const categoryId = Number(newProduct.categoryId);
      const colorIds = newProduct.colorIds
        .split(",")
        .map((value) => Number(value.trim()))
        .filter(Boolean);
      const imageUrls = newProduct.imageUrls
        .map((imageUrl) => imageUrl.trim())
        .filter(Boolean);
      const sizes = newProduct.sizes
        .filter((size) => size.sizeId && size.stockQuantity !== "")
        .map((size) => ({
          sizeId: Number(size.sizeId),
          stockQuantity: Number(size.stockQuantity),
        }));
      const hasIncompleteSize = newProduct.sizes.some(
        (size) =>
          (size.sizeId && size.stockQuantity === "") ||
          (!size.sizeId && size.stockQuantity !== ""),
      );
      if (hasIncompleteSize)
        throw new Error("Sélectionnez une taille et sa quantité, ou supprimez la ligne.");
      if (imageUrls.length === 0)
        throw new Error("Ajoutez au moins une image au produit.");
      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price,
          stockQuantity,
          brand: newProduct.brand,
          imageUrl: imageUrls[0],
          categoryId,
          active: true,
          images: imageUrls.map((imageUrl, index) => ({
            imageUrl,
            primaryImage: index === 0,
            sortOrder: index,
          })),
          sizes,
          colorIds,
        }),
      });

      if (!response.ok) throw new Error("La création du produit a échoué.");
      const created = await response.json();
      if (
        created.id !== undefined &&
        products.some((product) => product.id === created.id)
      )
        created.id = Date.now();
      setProducts((current) => [
        {
          id: created.id ?? Date.now(),
          name: created.name ?? newProduct.name,
          category: created.category?.name ?? `Catégorie ${categoryId}`,
          price: `${price.toFixed(2)} DH`,
          stock: created.stockQuantity ?? stockQuantity,
          sales: 0,
          status: "Publié",
          image: created.imageUrl ?? imageUrls[0],
          description: created.description ?? newProduct.description,
          brand: created.brand ?? newProduct.brand,
          images: created.images ?? imageUrls.map((imageUrl, index) => ({
            imageUrl,
            primaryImage: index === 0,
            sortOrder: index,
          })),
          sizes: created.sizes ?? sizes.map((size) => ({
            name: catalogOptions.sizes.find((option) => option.id === size.sizeId)?.name ?? `Taille ${size.sizeId}`,
            stockQuantity: size.stockQuantity,
          })),
          colors: created.colors ?? colorIds.map((colorId) => catalogOptions.colors.find((option) => option.id === colorId)?.name ?? `Couleur ${colorId}`),
        },
        ...current,
      ]);
      setAddProductOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        brand: "",
        imageUrls: [""],
        categoryId: "",
        sizes: [],
        colorIds: "",
      });
      await Swal.fire({
        icon: "success",
        title: "Produit ajouté",
        text: "Le produit a été créé avec succès.",
        confirmButtonColor: "#013d11",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Ajout impossible",
        text:
          error instanceof Error ? error.message : "Une erreur est survenue.",
        confirmButtonColor: "#013d11",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return <div className="min-h-screen bg-[#fffdf8]" />;

  return (
    <AdminLayout
          user={user}
          activeItem="Produits"
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
          query={query}
          onQueryChange={updateQuery}
          searchPlaceholder="Rechercher un produit..."
          productCount={products.length}
        >
        <main className="min-h-screen bg-[#fffdf8] text-[#201f1c]">
          <div className="mx-auto max-w-[1520px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <button
                onClick={() => router.push("/admin")}
                className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#b49768]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour au dashboard
              </button>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">
                Catalogue
              </p>
              <h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">
                Gestion des produits
              </h1>
              <p className="mt-2 text-sm text-[#948d83]">
                Gérez vos pièces, vos prix et vos niveaux de stock.
              </p>
            </div>
            <button
              onClick={() => setAddProductOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#201f1c] px-4 py-3 text-xs font-semibold text-white shadow-lg"
            >
              <Plus className="h-4 w-4 text-[#dfbd78]" />
              Ajouter un produit
            </button>
          </div>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Produits actifs</p>
              <p className="mt-2 font-serif text-3xl">
                {
                  products.filter((product) => product.status === "Publié")
                    .length
                }
              </p>
            </div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Stock faible</p>
              <p className="mt-2 font-serif text-3xl text-[#bd755f]">
                {products.filter((product) => product.stock < 10).length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Catégories</p>
              <p className="mt-2 font-serif text-3xl">
                {categories.length - 1}
              </p>
            </div>
          </div>
          <section className="rounded-2xl border border-[#e9e3d9] bg-white/80 p-4 shadow-[0_8px_30px_rgba(64,53,35,0.04)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-[#ece7df] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl">Tous les produits</h2>
                <p className="mt-1 text-xs text-[#999188]">
                  {filteredProducts.length} résultat
                  {filteredProducts.length > 1 ? "s" : ""} dans votre catalogue
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 sm:hidden">
                  <Search className="h-4 w-4 text-[#075D54]" />
                  <input
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-transparent text-xs outline-none"
                  />
                </label>
                <select
                  value={category}
                  onChange={(event) =>
                    updateFilter(setCategory, event.target.value)
                  }
                  className="h-10 rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 text-xs outline-none"
                >
                  <option>Toutes</option>
                  {categories.slice(1).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) =>
                    updateFilter(setStatus, event.target.value)
                  }
                  className="h-10 rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 text-xs outline-none"
                >
                  <option>Tous les statuts</option>
                  <option>Publié</option>
                  <option>Brouillon</option>
                </select>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {productsLoading && (
                <div className="col-span-full py-16 text-center text-sm text-[#948d83]">
                  Chargement des produits...
                </div>
              )}
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedImage(product.image);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedProduct(product);
                      setSelectedImage(product.image);
                    }
                  }}
                  className="group overflow-hidden rounded-xl border border-[#e9e3d9] bg-white transition-all hover:-translate-y-1 hover:border-[#c19a5b] hover:shadow-[0_12px_30px_rgba(64,53,35,0.10)]"
                >
                  <div className="relative aspect-[1.3] overflow-hidden bg-[#f4f1ea]">
                    <img
                      src={getProductImages(product)[cardImageIndexes[product.id] ?? 0]}
                      alt={product.name}
                      onClick={(event) => {
                        event.stopPropagation();
                        setFullscreenImage({
                          url: getProductImages(product)[cardImageIndexes[product.id] ?? 0],
                          alt: product.name,
                        });
                      }}
                      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {getProductImages(product).length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label={`Image précédente de ${product.name}`}
                          onClick={(event) =>
                            changeCardImage(event, product, "previous")
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[#013d11] shadow-md transition hover:bg-white"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Image suivante de ${product.name}`}
                          onClick={(event) =>
                            changeCardImage(event, product, "next")
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[#013d11] shadow-md transition hover:bg-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-medium ${product.status === "Publié" ? "bg-[#e3f0e6] text-[#578166]" : "bg-[#f4eddd] text-[#a17b3d]"}`}
                    >
                      {product.status}
                    </span>
                    <button
                      title={`Actions pour ${product.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenu(openMenu === product.id ? null : product.id);
                      }}
                      className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-[#6f685e] shadow-sm hover:bg-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === product.id && (
                      <div
                        className="absolute right-2 top-11 z-10 w-40 rounded-xl border border-[#e9e3d9] bg-white p-1.5 text-xs shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setOpenMenu(null);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-[#f8f7f0]"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() =>
                            toggleProductActive(product.id, product.status)
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-[#a17b3d] hover:bg-[#f4eddd]"
                        >
                          {product.status === "Publié" ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="w-full rounded-lg px-3 py-2 text-left text-[#bd755f] hover:bg-[#fdf0ed]"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#b49768]">
                      {product.category}
                    </p>
                    <h3 className="mt-1.5 truncate font-serif text-lg">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#201f1c]">
                          {product.price}
                        </p>
                        <p className="mt-1 text-[10px] text-[#999188]">
                          {product.sales} ventes
                        </p>
                      </div>
                      <p
                        className={
                          product.stock === 0
                            ? "text-right text-[10px] font-semibold text-[#bd755f]"
                            : product.stock < 10
                              ? "text-right text-[10px] font-semibold text-[#c19a5b]"
                              : "text-right text-[10px] text-[#67947c]"
                        }
                      >
                        {product.stock === 0
                          ? "Rupture"
                          : `${product.stock} unités`}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-sm text-[#948d83]">
                  Aucun produit ne correspond à vos filtres.
                </div>
              )}
            </div>
          </section>
          {selectedProduct && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#013d11]/45 p-4 backdrop-blur-sm"
              onClick={() => {
                setSelectedProduct(null);
                setSelectedImage(null);
              }}
            >
              <article
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/60 bg-white/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#e9e3d9] pb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#b49768]">
                      Détails du produit
                    </p>
                    <h2 className="mt-1 font-serif text-3xl text-[#201f1c]">
                      {selectedProduct.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#6f685e]">
                      {selectedProduct.category}
                      {selectedProduct.brand ? ` · ${selectedProduct.brand}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setSelectedImage(null);
                    }}
                    aria-label="Fermer les détails"
                    className="rounded-xl p-2 text-[#6f685e] hover:bg-[#f8f7f0]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="relative overflow-hidden rounded-2xl border border-[#e9e3d9] bg-[#f4f1ea]">
                    <img
                      src={selectedImage ?? selectedProduct.image}
                      alt={selectedProduct.name}
                      onClick={() =>
                        setFullscreenImage({
                          url: selectedImage ?? selectedProduct.image,
                          alt: selectedProduct.name,
                        })
                      }
                      className="aspect-square h-full w-full cursor-zoom-in object-cover"
                    />
                    {((selectedProduct.images?.length ?? 0) > 1 || selectedProduct.image) && (
                      <>
                        <button
                          type="button"
                          aria-label="Image précédente"
                          onClick={() => changeSelectedImage("previous")}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#013d11] shadow-md transition hover:bg-white"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Image suivante"
                          onClick={() => changeSelectedImage("next")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#013d11] shadow-md transition hover:bg-white"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#f8f7f0]/80 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#948d83]">Prix</p>
                        <p className="mt-1 text-lg font-semibold text-[#201f1c]">{selectedProduct.price}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f7f0]/80 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#948d83]">Stock total</p>
                        <p className="mt-1 text-lg font-semibold text-[#201f1c]">{selectedProduct.stock} unités</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#5e7771]">Description</p>
                      <p className="mt-1 text-sm leading-6 text-[#6f685e]">{selectedProduct.description || "Aucune description disponible."}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#5e7771]">Tailles et quantités</p>
                      {selectedProduct.sizes?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedProduct.sizes.map((size, index) => (
                            <span key={`${size.name}-${index}`} className="rounded-full border border-[#d9dfd7] bg-white/70 px-3 py-1.5 text-xs text-[#486b5c]">
                              {size.name}: {size.stockQuantity}
                            </span>
                          ))}
                        </div>
                      ) : <p className="mt-1 text-sm text-[#948d83]">Aucune taille définie.</p>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#5e7771]">Couleurs</p>
                      <p className="mt-1 text-sm text-[#6f685e]">{selectedProduct.colors?.length ? selectedProduct.colors.join(", ") : "Aucune couleur définie."}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-[#5e7771]">
                          Avis clients
                        </p>
                        {!reviewsLoading && !reviewsError && (
                          <span className="text-[10px] text-[#948d83]">
                            {productReviews.length} avis
                          </span>
                        )}
                      </div>
                      {reviewsLoading && (
                        <p className="mt-2 text-sm text-[#948d83]">
                          Chargement des avis...
                        </p>
                      )}
                      {reviewsError && (
                        <p className="mt-2 text-sm text-[#bd755f]">
                          {reviewsError}
                        </p>
                      )}
                      {!reviewsLoading && !reviewsError && productReviews.length === 0 && (
                        <p className="mt-2 text-sm text-[#948d83]">
                          Aucun avis pour ce produit.
                        </p>
                      )}
                      {!reviewsLoading && !reviewsError && productReviews.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {productReviews.map((review, index) => (
                            <div
                              key={review.id ?? `${review.clientId}-${index}`}
                              className="rounded-2xl border border-[#e9e3d9] bg-[#f8f7f0]/70 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-[#201f1c]">
                                    {review.clientName || "Client"}
                                  </p>
                                  <div className="mt-1 flex items-center gap-1" aria-label={`Note : ${review.rating} sur 5`}>
                                    {Array.from({ length: 5 }, (_, starIndex) => (
                                      <Star
                                        key={starIndex}
                                        className={`h-3.5 w-3.5 ${starIndex < review.rating ? "fill-[#c19a5b] text-[#c19a5b]" : "text-[#d9d2c5]"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {review.createdAt && (
                                  <time className="text-[10px] text-[#948d83]" dateTime={review.createdAt}>
                                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                                  </time>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-5 text-[#6f685e]">
                                {review.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedProduct.images?.length ? (
                  <div className="mt-6 border-t border-[#e9e3d9] pt-5">
                    <p className="text-xs font-semibold text-[#5e7771]">Galerie d’images</p>
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {[{ imageUrl: selectedProduct.image, primaryImage: true }, ...selectedProduct.images.filter((image) => image.imageUrl !== selectedProduct.image)].map((image, index) => (
                        <button
                          key={`${image.imageUrl}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(image.imageUrl)}
                          className={`overflow-hidden rounded-xl border-2 ${selectedImage === image.imageUrl ? "border-[#b49768]" : "border-transparent"}`}
                        >
                          <img src={image.imageUrl} alt={`${selectedProduct.name} ${index + 1}`} className="aspect-square w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            </div>
          )}
          {addProductOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#013d11]/35 p-4">
              <form
                onSubmit={createProduct}
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b49768]">
                      Catalogue
                    </p>
                    <h2 className="font-serif text-2xl">Ajouter un produit</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddProductOpen(false)}
                    className="rounded-lg p-2 text-[#777068] hover:bg-[#f8f7f0]"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#5e7771]">
                    Nom
                    <input
                      required
                      value={newProduct.name}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          name: event.target.value,
                        })
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#5e7771]">
                    Marque
                    <input
                      required
                      value={newProduct.brand}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          brand: event.target.value,
                        })
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#5e7771]">
                    Prix
                    <input
                      required
                      min="0"
                      step="0.01"
                      type="number"
                      value={newProduct.price}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          price: event.target.value,
                        })
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#5e7771]">
                    Stock
                    <input
                      required
                      min="0"
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          stockQuantity: event.target.value,
                        })
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                    />
                  </label>
                  <label className="text-xs font-semibold text-[#5e7771] sm:col-span-2">
                    Description
                    <textarea
                      required
                      value={newProduct.description}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          description: event.target.value,
                        })
                      }
                      className="mt-2 min-h-20 w-full rounded-xl border border-[#e2e8e3] px-3 py-2 text-sm outline-none focus:border-[#b49768]"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#5e7771]">Images du produit</p>
                      <button type="button" onClick={addImageUrl} className="rounded-lg border border-[#e2e8e3] px-3 py-1.5 text-[11px] font-semibold text-[#075D54] hover:bg-[#f8f7f0]">
                        + Ajouter une image
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {newProduct.imageUrls.map((imageUrl, index) => (
                        <div key={`image-${index}`} className="flex items-center gap-2">
                          <input
                            required={index === 0}
                            type="url"
                            value={imageUrl}
                            onChange={(event) => updateImageUrl(index, event.target.value)}
                            placeholder={`URL de l’image ${index + 1}`}
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                          />
                          {newProduct.imageUrls.length > 1 && (
                            <button type="button" onClick={() => removeImageUrl(index)} aria-label={`Supprimer l’image ${index + 1}`} className="rounded-lg p-2 text-[#bd755f] hover:bg-[#fdf0ed]">
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[10px] font-normal text-[#948d83]">La première image sera utilisée comme image principale.</p>
                  </div>
                  <label className="text-xs font-semibold text-[#5e7771]">
                    Catégorie
                    <select
                      required
                      value={newProduct.categoryId}
                      onChange={(event) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: event.target.value,
                        })
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] bg-white px-3 text-sm outline-none focus:border-[#b49768]"
                    >
                      <option value="">Choisir une catégorie</option>
                      {catalogOptions.categories.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#5e7771]">Tailles et quantités <span className="font-normal text-[#948d83]">(facultatif)</span></p>
                      <button type="button" onClick={addSize} className="rounded-lg border border-[#e2e8e3] px-3 py-1.5 text-[11px] font-semibold text-[#075D54] hover:bg-[#f8f7f0]">
                        + Ajouter une taille
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {newProduct.sizes.map((size, index) => (
                        <div key={`size-${index}`} className="flex items-center gap-2">
                          <select value={size.sizeId} onChange={(event) => updateSize(index, "sizeId", event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2e8e3] bg-white px-3 text-sm outline-none focus:border-[#b49768]">
                            <option value="">Choisir une taille</option>
                            {catalogOptions.sizes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                          </select>
                          <input min="0" type="number" value={size.stockQuantity} onChange={(event) => updateSize(index, "stockQuantity", event.target.value)} placeholder="Quantité" className="h-10 w-28 rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]" />
                          <button type="button" onClick={() => removeSize(index)} aria-label={`Supprimer la taille ${index + 1}`} className="rounded-lg p-2 text-[#bd755f] hover:bg-[#fdf0ed]">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-xs font-semibold text-[#5e7771]">
                      Couleurs
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {catalogOptions.colors.map((option) => {
                        const selected = newProduct.colorIds
                          .split(",")
                          .filter(Boolean)
                          .includes(String(option.id));
                        return (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8e3] px-3 py-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) => {
                                const ids = newProduct.colorIds
                                  .split(",")
                                  .filter(Boolean);
                                const nextIds = event.target.checked
                                  ? [...ids, String(option.id)]
                                  : ids.filter(
                                      (id) => id !== String(option.id),
                                    );
                                setNewProduct({
                                  ...newProduct,
                                  colorIds: Array.from(new Set(nextIds)).join(
                                    ",",
                                  ),
                                });
                              }}
                            />
                            {option.name}
                          </label>
                        );
                      })}
                    </div>
                    {catalogOptions.colors.length === 0 && (
                      <p className="mt-2 text-[10px] font-normal text-[#bd755f]">
                        Aucune couleur disponible.
                      </p>
                    )}
                  </fieldset>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddProductOpen(false)}
                    className="rounded-xl border border-[#e2e8e3] px-4 py-2.5 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="rounded-xl bg-[#201f1c] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "Envoi..." : "Créer le produit"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#013d11]/35 p-4">
              <form
                onSubmit={saveProduct}
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl">Modifier le produit</h2>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-lg p-2 text-[#777068] hover:bg-[#f8f7f0]"
                  >
                    ×
                  </button>
                </div>
                <label className="mt-5 block text-xs font-semibold text-[#5e7771]">
                  Nom du produit
                  <input
                    value={editingProduct.name}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: event.target.value,
                      })
                    }
                    className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                  />
                </label>
                <label className="mt-4 block text-xs font-semibold text-[#5e7771]">
                  Description
                  <textarea
                    required
                    value={editingProduct.description ?? ""}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: event.target.value,
                      })
                    }
                    className="mt-2 min-h-20 w-full rounded-xl border border-[#e2e8e3] px-3 py-2 text-sm outline-none focus:border-[#b49768]"
                  />
                </label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#5e7771]">
                  Prix
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={editingProduct.price
                      .replace(/DH$/i, "")
                      .replace(/\s/g, "")
                      .trim()}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: `${event.target.value} DH`,
                      })
                    }
                    className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                  />
                </label>
                <label className="text-xs font-semibold text-[#5e7771]">
                  Stock
                  <input
                    required
                    min="0"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(event.target.value),
                      })
                    }
                    className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                  />
                </label>
                <label className="text-xs font-semibold text-[#5e7771]">
                  Marque
                  <input
                    required
                    value={editingProduct.brand ?? ""}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: event.target.value,
                      })
                    }
                    className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                  />
                </label>
                <label className="text-xs font-semibold text-[#5e7771]">
                  Catégorie
                  <select
                    required
                    value={editingProduct.categoryId ?? ""}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: Number(event.target.value),
                        category:
                          catalogOptions.categories.find(
                            (option) => option.id === Number(event.target.value),
                          )?.name ?? editingProduct.category,
                      })
                    }
                    className="mt-2 h-10 w-full rounded-xl border border-[#e2e8e3] bg-white px-3 text-sm outline-none focus:border-[#b49768]"
                  >
                    <option value="">Choisir une catégorie</option>
                    {catalogOptions.categories.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#5e7771]">
                      Images du produit
                    </p>
                    <button
                      type="button"
                      onClick={addEditingImage}
                      className="rounded-lg border border-[#e2e8e3] px-3 py-1.5 text-[11px] font-semibold text-[#075D54] hover:bg-[#f8f7f0]"
                    >
                      + Ajouter une image
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {getProductImages(editingProduct).map((imageUrl, index) => (
                      <div key={`editing-image-${index}`} className="flex items-center gap-2">
                        <input
                          required={index === 0}
                          type="url"
                          value={imageUrl}
                          onChange={(event) =>
                            updateEditingImage(index, event.target.value)
                          }
                          placeholder={`URL de l’image ${index + 1}`}
                          className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeEditingImage(index)}
                            aria-label={`Supprimer l’image ${index + 1}`}
                            className="rounded-lg p-2 text-[#bd755f] hover:bg-[#fdf0ed]"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#5e7771]">
                      Tailles et quantités
                    </p>
                    <button
                      type="button"
                      onClick={addEditingSize}
                      className="rounded-lg border border-[#e2e8e3] px-3 py-1.5 text-[11px] font-semibold text-[#075D54] hover:bg-[#f8f7f0]"
                    >
                      + Ajouter une taille
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(editingProduct.sizes ?? []).map((size, index) => (
                      <div key={`editing-size-${index}`} className="flex items-center gap-2">
                        <select
                          required
                          value={size.sizeId ?? ""}
                          onChange={(event) =>
                            updateEditingSize(index, "sizeId", event.target.value)
                          }
                          className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2e8e3] bg-white px-3 text-sm outline-none focus:border-[#b49768]"
                        >
                          <option value="">Choisir une taille</option>
                          {catalogOptions.sizes.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        <input
                          required
                          min="0"
                          type="number"
                          value={size.stockQuantity}
                          onChange={(event) =>
                            updateEditingSize(index, "stockQuantity", event.target.value)
                          }
                          placeholder="Quantité"
                          className="h-10 w-28 rounded-xl border border-[#e2e8e3] px-3 text-sm outline-none focus:border-[#b49768]"
                        />
                        <button
                          type="button"
                          onClick={() => removeEditingSize(index)}
                          aria-label={`Supprimer la taille ${index + 1}`}
                          className="rounded-lg p-2 text-[#bd755f] hover:bg-[#fdf0ed]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold text-[#5e7771]">
                    Couleurs
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {catalogOptions.colors.map((option) => {
                      const selected = (editingProduct.colorIds ?? []).includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8e3] px-3 py-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) =>
                              setEditingProduct({
                                ...editingProduct,
                                colorIds: event.target.checked
                                  ? [...(editingProduct.colorIds ?? []), option.id]
                                  : (editingProduct.colorIds ?? []).filter(
                                      (id) => id !== option.id,
                                    ),
                              })
                            }
                          />
                          {option.name}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-xl border border-[#e2e8e3] px-4 py-2.5 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#201f1c] px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
          {fullscreenImage && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
              onClick={() => setFullscreenImage(null)}
            >
              <button
                type="button"
                aria-label="Fermer l’image plein écran"
                onClick={() => setFullscreenImage(null)}
                className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.alt}
                onClick={(event) => event.stopPropagation()}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          </div>
        </main>
    </AdminLayout>
  );
}
