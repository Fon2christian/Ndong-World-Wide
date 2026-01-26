import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CarForm from "../components/CreateCarForm";
import TireForm from "../components/TireForm";
import WheelDrumForm from "../components/WheelDrumForm";

type CategoryType = "cars" | "new-tires" | "used-tires" | "wheel-drums";
type FormCategory = "car" | "new-tire" | "used-tire" | "wheel-drum" | null;

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
}

interface Tire {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: "new" | "used";
  images: string[];
}

interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<CategoryType>("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [newTires, setNewTires] = useState<Tire[]>([]);
  const [usedTires, setUsedTires] = useState<Tire[]>([]);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedFormCategory, setSelectedFormCategory] = useState<FormCategory>(null);
  const [editingItem, setEditingItem] = useState<Car | Tire | WheelDrum | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [carsRes, newTiresRes, usedTiresRes, wheelDrumsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/cars`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=new`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=used`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/wheel-drums`),
      ]);
      setCars(carsRes.data);
      setNewTires(newTiresRes.data);
      setUsedTires(usedTiresRes.data);
      setWheelDrums(wheelDrumsRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete car:", err);
    }
  };

  const handleDeleteTire = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tire?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tires/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete tire:", err);
    }
  };

  const handleDeleteWheelDrum = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wheel drum?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/wheel-drums/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete wheel drum:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaved = () => {
    setSelectedFormCategory(null);
    setShowCategorySelector(false);
    setEditingItem(null);
    fetchData();
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowCategorySelector(true);
    setSelectedFormCategory(null);
  };

  const handleSelectCategory = (category: FormCategory) => {
    setSelectedFormCategory(category);
    setShowCategorySelector(false);
  };

  const handleCancel = () => {
    setSelectedFormCategory(null);
    setShowCategorySelector(false);
    setEditingItem(null);
  };

  const tabs = [
    { id: "cars" as CategoryType, label: "Cars", count: cars.length },
    { id: "new-tires" as CategoryType, label: "New Tires", count: newTires.length },
    { id: "used-tires" as CategoryType, label: "Used Tires", count: usedTires.length },
    { id: "wheel-drums" as CategoryType, label: "Wheel Drums", count: wheelDrums.length },
  ];

  const categoryOptions = [
    { id: "car" as FormCategory, label: "Car", icon: "🚗", description: "Add a new car to inventory" },
    { id: "new-tire" as FormCategory, label: "New Tire", icon: "🆕", description: "Add new tires" },
    { id: "used-tire" as FormCategory, label: "Used Tire", icon: "♻️", description: "Add used tires" },
    { id: "wheel-drum" as FormCategory, label: "Wheel Drum", icon: "🔧", description: "Add wheel drums" },
  ];

  const renderForm = () => {
    if (showCategorySelector) {
      return (
        <div className="form-panel">
          <div className="form-panel__header">
            <h2 className="form-panel__title">What would you like to add?</h2>
          </div>
          <div className="form-panel__body">
            <div className="category-selector">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  className="category-selector__item"
                  onClick={() => handleSelectCategory(option.id)}
                >
                  <span className="category-selector__icon">{option.icon}</span>
                  <span className="category-selector__label">{option.label}</span>
                  <span className="category-selector__description">{option.description}</span>
                </button>
              ))}
            </div>
            <div className="form__actions" style={{ marginTop: "1rem" }}>
              <button className="btn btn--secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedFormCategory === "car") {
      const editingCar = editingItem as Car | null;
      return (
        <div className="form-panel">
          <div className="form-panel__header">
            <h2 className="form-panel__title">{editingCar ? "Edit Car" : "Add New Car"}</h2>
          </div>
          <div className="form-panel__body">
            <CarForm
              initialData={editingCar ? {
                brand: editingCar.brand,
                model: editingCar.model,
                year: editingCar.year,
                price: editingCar.price,
                mileage: editingCar.mileage,
                fuel: editingCar.fuel,
                transmission: editingCar.transmission,
                images: editingCar.images,
              } : undefined}
              carId={editingCar?._id}
              onSaved={handleSaved}
            />
            <button className="btn btn--secondary" onClick={handleCancel} style={{ marginTop: "1rem" }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (selectedFormCategory === "new-tire" || selectedFormCategory === "used-tire") {
      const editingTire = editingItem as Tire | null;
      const condition = selectedFormCategory === "new-tire" ? "new" : "used";
      return (
        <div className="form-panel">
          <div className="form-panel__header">
            <h2 className="form-panel__title">
              {editingTire ? "Edit Tire" : `Add ${condition === "new" ? "New" : "Used"} Tire`}
            </h2>
          </div>
          <div className="form-panel__body">
            <TireForm
              initialData={editingTire ? {
                brand: editingTire.brand,
                size: editingTire.size,
                price: editingTire.price,
                condition: editingTire.condition,
                images: editingTire.images,
              } : undefined}
              tireId={editingTire?._id}
              defaultCondition={condition}
              onSaved={handleSaved}
            />
            <button className="btn btn--secondary" onClick={handleCancel} style={{ marginTop: "1rem" }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (selectedFormCategory === "wheel-drum") {
      const editingWheelDrum = editingItem as WheelDrum | null;
      return (
        <div className="form-panel">
          <div className="form-panel__header">
            <h2 className="form-panel__title">{editingWheelDrum ? "Edit Wheel Drum" : "Add Wheel Drum"}</h2>
          </div>
          <div className="form-panel__body">
            <WheelDrumForm
              initialData={editingWheelDrum ? {
                brand: editingWheelDrum.brand,
                size: editingWheelDrum.size,
                price: editingWheelDrum.price,
                condition: editingWheelDrum.condition,
                images: editingWheelDrum.images,
              } : undefined}
              wheelDrumId={editingWheelDrum?._id}
              onSaved={handleSaved}
            />
            <button className="btn btn--secondary" onClick={handleCancel} style={{ marginTop: "1rem" }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCarsTable = () => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Brand</th>
          <th>Model</th>
          <th>Year</th>
          <th>Price</th>
          <th>Mileage</th>
          <th>Fuel</th>
          <th>Transmission</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {cars.map((car) => (
          <tr key={car._id}>
            <td>
              {car.images.length > 0 ? (
                <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="admin-table__image" />
              ) : (
                <div className="admin-table__no-image">No image</div>
              )}
            </td>
            <td>{car.brand}</td>
            <td>{car.model}</td>
            <td>{car.year}</td>
            <td>¥{car.price.toLocaleString()}</td>
            <td>{car.mileage.toLocaleString()} km</td>
            <td className="capitalize">{car.fuel}</td>
            <td className="capitalize">{car.transmission}</td>
            <td>
              <div className="admin-table__actions">
                <button className="btn btn--small btn--warning" onClick={() => { setEditingItem(car); setSelectedFormCategory("car"); }}>
                  Edit
                </button>
                <button className="btn btn--small btn--danger" onClick={() => handleDeleteCar(car._id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTiresTable = (tires: Tire[], isNew: boolean) => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Brand</th>
          <th>Size</th>
          <th>Price</th>
          <th>Condition</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tires.map((tire) => (
          <tr key={tire._id}>
            <td>
              {tire.images.length > 0 ? (
                <img src={tire.images[0]} alt={`${tire.brand} ${tire.size}`} className="admin-table__image" />
              ) : (
                <div className="admin-table__no-image">No image</div>
              )}
            </td>
            <td>{tire.brand}</td>
            <td>{tire.size}</td>
            <td>¥{tire.price.toLocaleString()}</td>
            <td>
              <span className={`condition-badge condition-badge--${tire.condition}`}>
                {tire.condition}
              </span>
            </td>
            <td>
              <div className="admin-table__actions">
                <button className="btn btn--small btn--warning" onClick={() => { setEditingItem(tire); setSelectedFormCategory(isNew ? "new-tire" : "used-tire"); }}>
                  Edit
                </button>
                <button className="btn btn--small btn--danger" onClick={() => handleDeleteTire(tire._id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderWheelDrumsTable = () => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Brand</th>
          <th>Size</th>
          <th>Price</th>
          <th>Condition</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {wheelDrums.map((wd) => (
          <tr key={wd._id}>
            <td>
              {wd.images.length > 0 ? (
                <img src={wd.images[0]} alt={`${wd.brand} ${wd.size}`} className="admin-table__image" />
              ) : (
                <div className="admin-table__no-image">No image</div>
              )}
            </td>
            <td>{wd.brand}</td>
            <td>{wd.size}</td>
            <td>¥{wd.price.toLocaleString()}</td>
            <td>{wd.condition}</td>
            <td>
              <div className="admin-table__actions">
                <button className="btn btn--small btn--warning" onClick={() => { setEditingItem(wd); setSelectedFormCategory("wheel-drum"); }}>
                  Edit
                </button>
                <button className="btn btn--small btn--danger" onClick={() => handleDeleteWheelDrum(wd._id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = () => {
    switch (activeTab) {
      case "cars":
        return cars.length === 0 ? (
          <div className="admin-table__empty"><p>No cars in inventory. Add your first car!</p></div>
        ) : renderCarsTable();
      case "new-tires":
        return newTires.length === 0 ? (
          <div className="admin-table__empty"><p>No new tires in inventory. Add some!</p></div>
        ) : renderTiresTable(newTires, true);
      case "used-tires":
        return usedTires.length === 0 ? (
          <div className="admin-table__empty"><p>No used tires in inventory. Add some!</p></div>
        ) : renderTiresTable(usedTires, false);
      case "wheel-drums":
        return wheelDrums.length === 0 ? (
          <div className="admin-table__empty"><p>No wheel drums in inventory. Add some!</p></div>
        ) : renderWheelDrumsTable();
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your inventory</p>
        </div>
        <div className="admin-header__actions">
          <button className="btn btn--primary" onClick={handleAddNew}>
            + Add New
          </button>
          <button className="btn btn--secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {renderForm()}

      {/* Admin Tabs */}
      <nav className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tabs__tab ${activeTab === tab.id ? "admin-tabs__tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="admin-tabs__label">{tab.label}</span>
            <span className="admin-tabs__count">{tab.count}</span>
          </button>
        ))}
      </nav>

      <div className="admin-table-container">
        {renderTable()}
      </div>
    </div>
  );
}
