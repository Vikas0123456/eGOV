import React, { useState } from "react";
import { Badge, Card, CardBody, Carousel, CarouselItem } from "reactstrap";
import { formatedDate } from "../../common/CommonFunctions/common";
import AnnouncementsFilledSvg from "../../assets/svg/AnnouncementsFilledSvg";

const AnnouncementCarousel = ({ items, announcementsViewPermission }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const goToIndex = (newIndex) => {
        setActiveIndex(newIndex);
    };

    if (!announcementsViewPermission) {
        return "No announcement available";
    }

    if (!items || items.length === 0) {
        return "No announcement available";
    }

    const slides = items.map((item) => (
        <CarouselItem key={item.id} className="swiper-slide">
            <div className="swiper-slide">
                <div className="d-flex">
                    <div className="flex-shrink-0">
                        <AnnouncementsFilledSvg />
                    </div>
                    <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1">{item.title}</h6>
                        {item?.displayFrom && item?.displayTo && (
                            <p className="text-muted">
                                {formatedDate(item.displayFrom)} -{" "}
                                {formatedDate(item.displayTo)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </CarouselItem>
    ));

    return (
        <>
            <div className="swiper collection-slider">
                <Carousel
                    activeIndex={activeIndex}
                    next={() =>
                        setActiveIndex((prevIndex) =>
                            prevIndex === items.length - 1 ? 0 : prevIndex + 1
                        )
                    }
                    previous={() =>
                        setActiveIndex((prevIndex) =>
                            prevIndex === 0 ? items.length - 1 : prevIndex - 1
                        )
                    }
                    interval={3000}
                    className="swiper-wrapper"
                >
                    {slides}
                </Carousel>

                <div
                    className="clickable-area-left"
                    onClick={() =>
                        setActiveIndex((prevIndex) =>
                            prevIndex === 0 ? items.length - 1 : prevIndex - 1
                        )
                    }
                />
                <div
                    className="clickable-area-right"
                    onClick={() =>
                        setActiveIndex((prevIndex) =>
                            prevIndex === items.length - 1 ? 0 : prevIndex + 1
                        )
                    }
                />
            </div>
            <div className="swiper-pagination position-relative text-start">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className={activeIndex === index ? "active" : ""}
                    />
                ))}
            </div>
        </>
    );
};

export default AnnouncementCarousel;
