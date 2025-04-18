const SectionWrapper = ({children, title, description, Icon, cornerComponent, shouldHaveMarginTop = false}) => {
  return (
    <div className={`rounded-md bg-palette2 ${shouldHaveMarginTop ? 'mt-8' : ''}`}>
      <div className="flex justify-between">
        <div className="flex items-center gap-2 pt-8 px-8">
          {<Icon className="size-6 text-palette4" />}
          <span className="text-2xl text-black font-bold leading-none">{title}</span>
          <span className="text-sm text-gray-700 italic font-light leading-none">{description}</span>
        </div>

        <div>{cornerComponent}</div>
      </div>

      <div className="pt-8 px-8">{children}</div>
    </div>
  );
};

export default SectionWrapper;