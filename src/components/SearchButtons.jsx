import React, { useState, useContext, useRef, useEffect } from "react";
import { FaHeart, FaRandom, FaFilter, FaSearch, FaStar } from "react-icons/fa";
import "../styles/SearchButtons.css";
import { useTranslation } from "react-i18next";
import { FetchContext } from "../contexts/FetchContext";
import { UserContext } from "../contexts/UserContext";

const SearchButtons = () => {
  const { t } = useTranslation();
  const {
    setShowFavorites,
    changeDisplayMode,
    displayMode,
    getRandomStation,
    fetchTopStations,
    searchStationsByName,
    searchStationsByFilters,
  } = useContext(FetchContext);
  const { isAuthenticated } = useContext(UserContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState({
    name: "",
    country: "",
    language: "",
    genre: "",
    bitrate: "",
    codec: [],
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      searchStationsByName(searchValue);
      setSearchValue("");
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && searchValue.trim()) {
      e.preventDefault();
      console.log("Enter pressed, searching for:", searchValue);
      await searchStationsByName(searchValue);
    }
    setIsDropdownOpen(false);
  };

  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCodecChange = (codec, checked) => {
    setFilterValues((prev) => ({
      ...prev,
      codec: checked
        ? [...prev.codec, codec]
        : prev.codec.filter((c) => c !== codec),
    }));
  };

  const handleFilterSubmit = async () => {
    const filters = Object.fromEntries(
      Object.entries(filterValues).filter(([_, value]) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      )
    );

    if (Object.keys(filters).length > 0) {
      try {
        console.log("Applying filters:", filters);
        await searchStationsByFilters(filters);
        setIsDropdownOpen(false);
        setFilterValues({
          name: "",
          country: "",
          language: "",
          genre: "",
          bitrate: "",
          codec: [],
        });
      } catch (error) {
        console.error("Filter search failed:", error.message);
        setIsDropdownOpen(true);
      }
    }
  };

  const handleFilterKeyPress = (e) => {
    if (e.key === "Enter") {
      handleFilterSubmit();
    }
  };

  return (
    <div className="search-buttons-container">
      <div className="top-buttons">
        <button
          className={`button ${displayMode === "favorites" ? "active" : ""}`}
          onClick={() => changeDisplayMode("favorites")}
          disabled={!isAuthenticated}
        >
          <FaHeart size={24} /> {t("My favorites")}
        </button>
        <button className="button" onClick={() => getRandomStation()}>
          <FaRandom size={24} /> {t("Random channels")}
        </button>
        <button
          className={`button ${displayMode === "topvote" ? "active" : ""}`}
          onClick={() => {
            changeDisplayMode("topvote");
            fetchTopStations();
          }}
        >
          <FaStar size={24} /> {t("Popular channels")}
        </button>
      </div>

      <div className="bottom-section">
        <div className="filter-section">
          <button
            className="button filter-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaFilter size={24} /> {t("More filters")}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu" ref={dropdownRef}>
              <div className="filter-field">
                <label className="text-sm">{t("Channel name:")}</label>
                <input
                  type="text"
                  placeholder={t("Enter station name in English")}
                  value={filterValues.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  onKeyDown={handleFilterKeyPress}
                />
              </div>
              <div className="filter-field">
                <label>{t("Country:")}</label>
                <input
                  type="text"
                  placeholder={t("Enter country in English")}
                  value={filterValues.country}
                  onChange={(e) =>
                    handleFilterChange("country", e.target.value)
                  }
                  onKeyDown={handleFilterKeyPress}
                />
              </div>
              <div className="filter-field">
                <label>{t("Language:")}</label>
                <input
                  type="text"
                  placeholder={t("Enter language in English")}
                  value={filterValues.language}
                  onChange={(e) =>
                    handleFilterChange("language", e.target.value)
                  }
                  onKeyDown={handleFilterKeyPress}
                />
              </div>
              <div className="filter-field">
                <label>{t("Genre:")}</label>
                <input
                  type="text"
                  placeholder={t("Enter genre in English")}
                  value={filterValues.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  onKeyDown={handleFilterKeyPress}
                />
              </div>
              <div className="filter-field">
                <label>{t("Min. Bitrate:")}</label>
                <input
                  type="number"
                  placeholder={t("Enter bitrate")}
                  value={filterValues.bitrate}
                  onChange={(e) =>
                    handleFilterChange("bitrate", e.target.value)
                  }
                  onKeyDown={handleFilterKeyPress}
                />
              </div>
              <div className="codec-selection">
                <label>{t("Codec")}:</label>
                <div className="checkbox-group">
                  {["mp3", "aac", "ogg"].map((codec) => (
                    <label key={codec}>
                      <input
                        type="checkbox"
                        value={codec}
                        checked={filterValues.codec.includes(codec)}
                        onChange={(e) =>
                          handleCodecChange(codec, e.target.checked)
                        }
                      />
                      {codec.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div className="dropdown-search-button-container">
                <button
                  className="button dropdown-search-button"
                  onClick={handleFilterSubmit}
                  disabled={Object.values(filterValues).every((v) =>
                    Array.isArray(v) ? v.length === 0 : !v
                  )}
                >
                  <FaSearch size={24} />
                  {t("Apply")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="search-section">
          <input
            type="text"
            id="station-search"
            className="search-input"
            placeholder={t("Search for channels...")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="button search-button"
            id="search-button"
            onClick={handleSearch}
            disabled={!searchValue.trim()}
          >
            <FaSearch size={24} /> {t("Search")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchButtons;
