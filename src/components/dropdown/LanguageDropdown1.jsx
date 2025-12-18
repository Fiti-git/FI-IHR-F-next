"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function LanguageDropdown1() {
  const [getSpeak, setSpeak] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const setSpeakState = listingStore((state) => state.setSpeak);
  const getSpeakState = listingStore((state) => state.getSpeak);

  const speakHandler = (data) => {
    if (!getSpeak.includes(data)) {
      return setSpeak([...getSpeak, data]);
    }
    const deleted = getSpeak.filter((item) => item !== data);
    setSpeak(deleted);
  };

  const speakSubmitHandler = () => {
    setSpeakState([]);
    getSpeak.forEach((item) => {
      setSpeakState(item);
    });
  };

  useEffect(() => {
    setSpeak(getSpeakState);
  }, [getSpeakState]);

  // Fetch Languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get("/api/profile/freelancers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        const uniqueLangs = [...new Set(
          data.map(item => item.language).filter(Boolean)
        )];
        setAvailableLanguages(uniqueLangs.sort());
      } catch (err) {
        console.error(err);
      }
    };
    fetchLanguages();
  }, []);

  const formatLang = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <div className="widget-wrapper pr20">
        <div className="checkbox-style1">
           {availableLanguages.length === 0 ? <p className="text-muted text-sm">No languages found</p> : null}

          {availableLanguages.map((lang, i) => (
            <label key={i} className="custom_checkbox">
              {formatLang(lang)}
              <input
                type="checkbox"
                checked={getSpeak.includes(lang)}
                onChange={() => speakHandler(lang)}
              />
              <span className="checkmark" />
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={speakSubmitHandler}
        className="done-btn ud-btn btn-thm drop_btn4"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}