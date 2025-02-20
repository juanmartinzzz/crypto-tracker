const SectionWrapper = ({children, title, description, Icon, shouldHaveMarginTop = false}) => {
  return (
    <div className={`rounded-md bg-palette2 p-8 ${shouldHaveMarginTop ? 'mt-8' : ''}`}>
      <div className="flex items-end gap-2 mb-4">
        {<Icon className="size-6 text-palette4" />}
        <span className="text-2xl text-black font-bold leading-none">{title}</span>
        <span className="text-sm text-gray-700 italic font-light leading-none">{description}</span>
      </div>

      {children}
    </div>
  );
};

export default SectionWrapper;